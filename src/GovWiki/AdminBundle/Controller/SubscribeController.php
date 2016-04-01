<?php

namespace GovWiki\AdminBundle\Controller;

use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\EntityRepository;
use GovWiki\DbBundle\Entity\Government;
use GovWiki\UserBundle\Entity\User;
use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Validator\Constraints\NotBlank;

/**
 * Class SubscribeController
 * @package GovWiki\AdminBundle\Controller
 *
 * @Configuration\Route(
 *  "/{government}/subscribers",
 *  requirements={ "governments": "\d+" }
 * )
 */
class SubscribeController extends AbstractGovWikiAdminController
{
    const MAX_PER_PAGE = 25;

    /**
     * @Configuration\Route("/")
     * @Configuration\Template()
     *
     * @param Request    $request    A Request instance.
     * @param Government $government A Government instance.
     *
     * @return array
     */
    public function indexAction(Request $request, Government $government)
    {
        $em = $this->getDoctrine()->getManager();
        $form = $this->createFormBuilder()
            ->add('message', 'textarea', [ 'constraints' => new NotBlank() ])
            ->getForm();

        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            $body = $form->getData()['message'];

            $chat = $government->getChat();
            $user = $this->getUser();
            $service_chat_message = $this->get('govwiki.user_bundle.chat_message');
            $user_email = $user->getEmail();
            $user_phone = $user->getPhone();

            // Save Twilio sms messages into base
            $phones = $service_chat_message->getChatMessageReceiversPhonesList($chat, $government, $user_phone);
            $sms_body = '
' . $body . '
From ' . $user_email;
            $service_chat_message->persistTwilioSmsMessages($phones, $this->getParameter('twilio.from'), $sms_body);

            // Save Email messages into base
            $emails = $service_chat_message->getChatMessageReceiversEmailList($chat, $government, $user_email, true);
            $chat_email = $this->getParameter('chat_email');
            $service_chat_message->persistEmailMessages(
                $emails,
                $chat_email,
                'New message in ' . $government->getName(),
                [
                    'author' => $user_email,
                    'government_name' => $government->getName(),
                    'message_text' => $body
                ]
            );

            $em->flush();

            $this->successMessage('Message sent to subscribers');

            return $this->redirectToRoute('govwiki_admin_subscribe_index', [
                'government' => $government->getId(),
            ]);
        }

        return [
            'form' => $form->createView(),
            'government' => $government,
            'subscribers' => $this->paginate(
                $em->getRepository('GovWikiUserBundle:User')
                    ->getGovernmentSubscribersQuery($government->getId()),
                $request->query->get('page', 1),
                self::MAX_PER_PAGE
            ),
        ];
    }

    /**
     * @Configuration\Route("/add")
     * @Configuration\Template()
     *
     * @param Request    $request    A Request instance.
     * @param Government $government A Government entity instance.
     *
     * @return array
     */
    public function addAction(Request $request, Government $government)
    {
        $subscribers = $this->getDoctrine()
            ->getRepository('GovWikiUserBundle:User')
            ->getSubscriberIds($government->getId());

        $form = $this->createFormBuilder()
            ->add('users', 'entity', [
                'class' => 'GovWiki\UserBundle\Entity\User',
                'multiple' => true,
                'query_builder' => function(EntityRepository $repository) use ($subscribers) {
                    $qb = $repository->createQueryBuilder('User');
                    $expr = $qb->expr();

                    if (count($subscribers) > 0) {
                        $qb
                            ->where($expr->notIn('User.id', ':alreadySubscribed'))
                            ->setParameter('alreadySubscribed', $subscribers);
                    }

                    return $qb;
                }
            ])
            ->getForm();

        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            /** @var EntityManagerInterface $em */
            $em = $this->getDoctrine()->getManager();
            $chat = $government->getChat();

            foreach ($form->getData()['users'] as $user) {
                $government->addSubscriber($user);
                $chat->addMember($user);
            }

            $em->persist($government);
            $em->flush();

            $this->successMessage('New subscribers added.');

            return $this->redirectToRoute('govwiki_admin_subscribe_index', [
                'government' => $government->getId(),
            ]);
        }

        return [
            'government' => $government,
            'form' => $form->createView(),
        ];
    }

    /**
     * @Configuration\Route("/{subscriber}/remove")
     *
     * @param Government $government A Government entity instance.
     * @param User       $subscriber A User entity instance.
     *
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function removeAction(Government $government, User $subscriber)
    {
        $em = $this->getDoctrine()->getManager();

        $government->removeSubscriber($subscriber);
        $government->getChat()->removeMember($subscriber);

        $em->persist($government);
        $em->flush();

        return $this->redirectToRoute('govwiki_admin_subscribe_index', [
            'government' => $government->getId(),
        ]);
    }
}
