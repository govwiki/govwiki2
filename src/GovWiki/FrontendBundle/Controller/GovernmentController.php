<?php

namespace GovWiki\FrontendBundle\Controller;

use GovWiki\ApiBundle\GovWikiApiServices;
use GovWiki\DbBundle\Entity\Chat;
use GovWiki\DbBundle\Entity\EmailMessage;
use GovWiki\DbBundle\Entity\Government;
use GovWiki\DbBundle\Utils\Functions;
use GovWiki\DbBundle\Entity\Message;
use GovWiki\DbBundle\Entity\TwilioSmsMessages;
use GovWiki\DbBundle\Form\MessageType;
use GovWiki\UserBundle\Entity\User;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Doctrine\ORM\EntityManager;

/**
 * MainController
 */
class GovernmentController extends Controller
{

    /**
     * Toggle government subscribe.
     *
     * @Route("/{government}/subscribe")
     * @ParamConverter(
     *  class="\GovWiki\DbBundle\Entity\Government",
     *  options={
     *      "repository_method": "getWithSubscribers"
     *  }
     * )
     *
     * @param Government $government A Government instance.
     *
     * @return JsonResponse
     */
    public function subscribeAction(Government $government)
    {
        /** @var User $user */
        $user = $this->getUser();
        $em = $this->getDoctrine()->getManager();

        if ($government->isSubscriber($user)) {
            $government->removeSubscribers($user);
        } else {
            $government->addSubscribers($user);
        }

        $em->persist($government);
        $em->flush();

        return new JsonResponse();
    }

    /**
     * @Route("/{altTypeSlug}/{slug}", name="government")
     * @Template("GovWikiFrontendBundle:Government:index.html.twig")
     *
     * @param Request $request     A Request instance.
     * @param string  $altTypeSlug Slugged government alt type.
     * @param string  $slug        Slugged government name.
     *
     * @return array
     */
    public function governmentAction(Request $request, $altTypeSlug, $slug)
    {
        $this->clearTranslationsCache();
        $manager = $this->get(GovWikiApiServices::ENVIRONMENT_MANAGER);
        $user = $this->getUser();

        $years = $manager->getAvailableYears();
        $currentYear = $request->query->getInt('year', $years[0]);

        $data = $manager
            ->getGovernment(
                $altTypeSlug,
                $slug,
                $currentYear
            );

        $finData = $data['government']['finData'];
        /*
         * Translate.
         */
        $translator = $this->get('translator');

        function getTransKey($caption) {
            return strtr(strtolower($caption), [
                ' ' => '_',
                '-' => '_d_',
                '&' => 'amp',
                ',' => '_c_',
                '(' => 'lb',
                ')' => 'rb',
                '/' => 'sl',
                '%' => 'proc',
                "'" => '_apos_',
            ]);
        }

        $finData = array_map(
            function (array $row) use ($translator) {
                $captionKey = 'findata.captions.'. getTransKey($row['caption']);
                $categoryKey = 'general.findata.main.'. getTransKey($row['category_name']);

                $row['translatedCaption'] = $translator->trans($captionKey);
                $row['translatedCategory'] = $translator->trans($categoryKey);

                return $row;
            },
            $finData
        );


        $finData = Functions::groupBy(
            $finData,
            [ 'category_name', 'caption' ]
        );
        /*
        * Sort findata by display order.
        */
        foreach ($finData as &$statement) {
            uasort($statement, function ($a, $b) {
                $a = $a['display_order'];
                $b = $b['display_order'];

                if ($a === $b) {
                    return 0;
                }

                return ($a < $b) ? -1: 1;
            });
        }

        $data['government']['financialStatements'] = $finData;

        $data['isSubscriber'] = false;
        if ($user instanceof User) {
            $data['isSubscriber'] = $this->getDoctrine()
                ->getRepository('GovWikiDbBundle:Government')
                ->isSubscriber($data['government']['id'], $user->getId());
        }

        $data['years'] = $years;
        $data['government']['translations'] = [
            'total_revenue' => $translator->trans('general.findata.main.total_revenue'),
            'total_expenditure' => $translator->trans('general.findata.main.total_expenditure'),
        ];

        $data['government_json'] = json_encode($data['government']);
        $em = $this->getDoctrine()->getManager();
        $new_message = new Message();
        $message_form = $this->createForm(new MessageType(), $new_message);

        $message_form->handleRequest($request);
        if ($message_form->isValid()) {
            $env_name = $this->get(GovWikiApiServices::ENVIRONMENT_MANAGER)->getEnvironment();
            /** @var Government $government */
            $government = $em->getRepository('GovWikiDbBundle:Government')
                ->getListQuery($env_name, $data['government']['id'])
                ->getOneOrNullResult();

            if ($government) {
                $chat = $government->getChat();

                if (!$chat) {
                    $chat = new Chat();
                    $subscribers = $government->getSubscribers();
                    foreach ($subscribers as $subscriber) {
                        $chat->addMember($subscriber);
                    }
                    $chat->setGovernment($government);
                    $government->setChat($chat);
                    $em->persist($chat);
                }

                if ($this->isMember($chat, $user->getId())) {
                    $new_message->setChat($chat);
                    $new_message->setAuthor($user);
                    $em->persist($new_message);

                    // Save Twilio sms messages into base
                    $phones = $this->getPhones($em, $chat, $government, $user);
                    foreach ($phones as $phone) {
                        $twilioSmsMessage = new TwilioSmsMessages();
                        $twilioSmsMessage->setFromNumber($this->getParameter('twilio.from'));
                        $twilioSmsMessage->setToNumber($phone);
                        $twilioSmsMessage->setMessage($new_message->getText() . '
From ' . $user->getEmail());
                        $em->persist($twilioSmsMessage);
                    }

                    // Save Email messages into base
                    $emails = $this->getEmails($em, $chat, $government, $user);
                    $env_admin_email = $government->getEnvironment()->getAdminEmail();
                    foreach ($emails as $email) {
                        $emailMessage = new EmailMessage();
                        $emailMessage->setFromEmail($env_admin_email);
                        $emailMessage->setToEmail($email);
                        $emailMessage->setSubject('New message in ' . $government->getName());
                        $emailMessage->setMessage($this->renderView('GovWikiFrontendBundle:Government:chatMessageEmail.html.twig', array(
                            'recipient' => $email,
                            'author' => $user->getEmail(),
                            'government_name' => $government->getName(),
                            'message_text' => $new_message->getText()
                        )));
                        $em->persist($emailMessage);
                    }

                    $em->flush();

                    $this->addFlash('message_saved_success', 'Your message was sent to all subscribers of the government.');

                    return $this->redirectToRoute('government', array(
                        'environment' => $env_name,
                        'altTypeSlug' => $altTypeSlug,
                        'slug' => $slug
                    ));
                }
            }
        }
        $data['message_form'] = $message_form->createView();

        return $data;
    }

    /**
     * @param Chat $chat Chat entity
     * @param integer $user_id User's ID
     *
     * @return boolean
     */
    private function isMember($chat, $user_id)
    {
        $members = $chat->getMembers();
        foreach ($members as $member) {
            if ($member->getId() == $user_id) {
                return true;
            }
        }
        return false;
    }

    /**
     * @param EntityManager $em Entity Manager
     * @param Chat $chat Chat
     * @param Government $government Current government
     * @param User $author Sms author
     *
     * @return array
     */
    private function getPhones($em, $chat, $government, $author)
    {
        $phones = array();

        $members = $chat->getMembers();
        /** @var User $member */
        foreach ($members as $member) {
            $member_phone = $member->getPhone();
            if ($member_phone != $author->getPhone() && !empty($member_phone)) {
                $phones[] = $member_phone;
            }
        }

        $env = $government->getEnvironment();
        $env_users = $env->getUsers();
        /** @var User $user */
        foreach ($env_users as $user) {
            $user_phone = $user->getPhone();
            if ($user_phone != $author->getPhone() && $user->hasRole('ROLE_MANAGER') && !empty($user_phone)) {
                $phones[] = $user_phone;
            }
        }

        $admins_list = $em->getRepository('GovWikiUserBundle:User')->getAdminsList();
        /** @var User $admin */
        foreach ($admins_list as $admin) {
            $admin_phone = $admin->getPhone();
            if ($admin_phone != $author->getPhone() && !empty($admin_phone)) {
                $phones[] = $admin_phone;
            }
        }

        return array_unique($phones);
    }

    /**
     * @param EntityManager $em Entity Manager
     * @param Chat $chat Chat
     * @param Government $government Current government
     * @param User $author Sms author
     *
     * @return array
     */
    private function getEmails($em, $chat, $government, $author)
    {
        $emails = array();

        $members = $chat->getMembers();
        /** @var User $member */
        foreach ($members as $member) {
            if ($member->getEmail() != $author->getEmail()) {
                $emails[] = $member->getEmail();
            }
        }

        $env = $government->getEnvironment();
        $env_users = $env->getUsers();
        /** @var User $user */
        foreach ($env_users as $user) {
            if ($user->hasRole('ROLE_MANAGER') && $user->getEmail() != $author->getEmail()) {
                $emails[] = $user->getEmail();
            }
        }

        $admins_list = $em->getRepository('GovWikiUserBundle:User')->getAdminsList();
        /** @var User $admin */
        foreach ($admins_list as $admin) {
            if ($admin->getEmail() != $author->getEmail()) {
                $emails[] = $admin->getEmail();
            }
        }

        return array_unique($emails);
    }

    private function clearTranslationsCache()
    {
        $cacheDir = __DIR__ . "/../../../../app/cache";
        $finder = new \Symfony\Component\Finder\Finder();
        $finder->in([$cacheDir . "/" . $this->container->getParameter('kernel.environment') . "/translations"])->files();
        foreach($finder as $file){
            unlink($file->getRealpath());
        }
    }
}
