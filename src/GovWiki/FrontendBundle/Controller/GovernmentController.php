<?php

namespace GovWiki\FrontendBundle\Controller;

use GovWiki\ApiBundle\GovWikiApiServices;
use GovWiki\DbBundle\Entity\Chat;
use GovWiki\DbBundle\Entity\Government;
use GovWiki\DbBundle\Entity\Issue;
use GovWiki\DbBundle\Utils\Functions;
use GovWiki\DbBundle\Entity\Message;
use GovWiki\DbBundle\Form\MessageType;
use GovWiki\EnvironmentBundle\Controller\AbstractGovWikiController;
use GovWiki\UserBundle\Entity\User;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

/**
 * MainController
 */
class GovernmentController extends AbstractGovWikiController
{

    const MAX_SALARIES_PER_PAGE = 25;
    const MAX_PENSIONS_PER_PAGE = 25;
    const MAX_DOCUMENTS_PER_PAGE = 5;

    /**
     * @Route("/{government}/salaries", requirements={
     *  "government": "\d+"
     * })
     * @Template
     *
     * @param Request $request    A Request instance.
     * @param integer $government Government entity id.
     *
     * @return array
     */
    public function salariesAction(Request $request, $government)
    {
        if ($this->getCurrentEnvironment() === null) {
            // Return empty response.
            return new Response();
        }

        $paginator = $this->get('knp_paginator');
        $year = $request->query->get(
            'year',
            $this->getGovernmentManager()
                ->getAvailableYears(
                    $this->getCurrentEnvironment()
                )[0]
        );

        $salaries = $this->getDoctrine()
            ->getRepository('GovWikiDbBundle:Salary')
            ->getListQuery($government, $year);
        $salaries = $paginator->paginate(
            $salaries,
            $request->query->get('page', 1),
            self::MAX_SALARIES_PER_PAGE
        );
        /** @var \Knp\Bundle\PaginatorBundle\Pagination\SlidingPagination $salaries */
        $salaries->setUsedRoute('govwiki_frontend_government_salaries');
        $salaries->setParam('government', $government);

        return [ 'salaries' => $salaries ];
    }

    /**
     * @Route("/{government}/pensions", requirements={
     *  "government": "\d+"
     * })
     * @Template
     *
     * @param Request $request    A Request instance.
     * @param integer $government Government entity id.
     *
     * @return array
     */
    public function pensionsAction(Request $request, $government)
    {
        if ($this->getCurrentEnvironment() === null) {
            // Return empty response.
            return new Response();
        }

        $paginator = $this->get('knp_paginator');
        $year = $request->query->get(
            'year',
            $this->getGovernmentManager()
                ->getAvailableYears(
                    $this->getCurrentEnvironment()
                )[0]
        );

        $pensions = $this->getDoctrine()
            ->getRepository('GovWikiDbBundle:Pension')
            ->getListQuery($government, $year);
        $pensions = $paginator->paginate(
            $pensions,
            $request->query->get('page', 1),
            self::MAX_PENSIONS_PER_PAGE
        );
        /** @var \Knp\Bundle\PaginatorBundle\Pagination\SlidingPagination $pensions */
        $pensions->setUsedRoute('govwiki_frontend_government_pensions');
        $pensions->setParam('government', $government);

        return [ 'pensions' => $pensions ];
    }

    /**
     * @Route("/{government}/issues", requirements={
     *  "government": "\d+"
     * })
     * @Template
     *
     * @param Request    $request    A Request instance.
     * @param Government $government A Government entity instance.
     *
     * @return array|Response
     */
    public function issuesAction(Request $request, Government $government)
    {
        $environment = $this->getCurrentEnvironment();
        if ($environment === null) {
            return $this->redirectToRoute('disabled');
        }

        $user = $this->getUser();
        $paginator = $this->get('knp_paginator');

        $issues = $this->getDoctrine()
            ->getRepository('GovWikiDbBundle:Issue')
            ->getListQuery($government->getId(), $user instanceof User);
        $issues = $paginator->paginate(
            $issues,
            $request->query->get('page', 1),
            self::MAX_DOCUMENTS_PER_PAGE
        );

        /** @var \Knp\Bundle\PaginatorBundle\Pagination\SlidingPagination $issues */
        $issues->setUsedRoute('govwiki_frontend_government_issues');
        $issues->setParam('government', $government->getId());

        if ($issues->count() === 0 ) {
            return new Response();
        }

        return [ 'issues' => $issues ];
    }

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
        if ($this->getCurrentEnvironment() === null) {
            return new JsonResponse([], 400);
        }

        /** @var User $user */
        $user = $this->getUser();
        $em = $this->getDoctrine()->getManager();

        if ($government->isSubscriber($user)) {
            $government->removeSubscribers($user);
            $government->getChat()->removeMember($user);
        } else {
            $government->addSubscribers($user);

            // Add chat if it not exists.
            if ($government->getChat() === null) {
                $chat = new Chat();
                $chat->setGovernment($government);
                $government->setChat($chat);
            }

            $government->getChat()->addMember($user);
        }

        $em->persist($government);
        $em->flush();

        return new JsonResponse();
    }

    /**
     * @Route("/{altTypeSlug}/{slug}", name="government", requirements={
     *  "altTypeSlug": "\w+",
     *  "slug": "\w+"
     * })
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
        if ($this->getCurrentEnvironment() === null) {
            return $this->redirectToRoute('disabled');
        }
        $user = $this->getUser();

        $this->clearTranslationsCache();
        $manager = $this->getGovernmentManager();
        $environment = $this->getCurrentEnvironment();

        $years = $manager->getAvailableYears($environment);
        $currentYear = $request->query->getInt('year', $years[0]);

        $data = $manager
            ->getGovernment(
                $environment,
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
                if (array_key_exists('totalfunds', $a) &&
                    array_key_exists('totalfunds', $b)) {
                    $a = $a['totalfunds'];
                    $b = $b['totalfunds'];

                    if ($a === $b) {
                        return 0;
                    }

                    return ($a < $b) ? 1: -1;
                }

                return 0;
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
        $data['currentYear'] = $currentYear;
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
                ->getListQuery($environment->getId(), $data['government']['id'])
                ->getOneOrNullResult();

            if ($government) {
                $chat = $government->getChat();

                if (!$chat) {
                    $chat = new Chat();
                    $subscribers = $government->getSubscribers();
                    /** @var User $subscriber */
                    foreach ($subscribers as $subscriber) {
                        if (!$subscriber->hasRole('ROLE_MANAGER') && !$subscriber->hasRole('ROLE_ADMIN')) {
                            $chat->addMember($subscriber);
                        }
                    }
                    $chat->setGovernment($government);
                    $government->setChat($chat);
                    $em->persist($chat);
                }

                if ($this->isMember($chat, $user->getId())) {
                    $new_message->setChat($chat);
                    $new_message->setAuthor($user);
                    $em->persist($new_message);

                    $user_email = $user->getEmail();
                    $user_phone = $user->getPhone();
                    $service_chat_message = $this->get('govwiki.user_bundle.chat_message');

                    // Save Twilio sms messages into base
                    $phones = $service_chat_message->getChatMessageReceiversPhonesList($chat, $government, $user_phone);
                    $sms_body = '
' . $new_message->getText() . '
From ' . $user_email;
                    $service_chat_message->persistTwilioSmsMessages($phones, $this->getParameter('twilio.from'), $sms_body);

                    // Save Email messages into base
                    $emails = $service_chat_message->getChatMessageReceiversEmailList($chat, $government, $user_email);
                    $chat_email = $this->getParameter('chat_email');
                    $service_chat_message->persistEmailMessages(
                        $emails,
                        $chat_email,
                        'New message in ' . $government->getName(),
                        [
                            'author' => $user_email,
                            'government_name' => $government->getName(),
                            'message_text' => $new_message->getText(),
                        ]
                    );

                    $em->flush();

                    $this->addFlash('message_saved_success', 'Your message was sent to all subscribers of the government.');

                    return $this->redirectToRoute('government', [
                        'environment' => $env_name,
                        'altTypeSlug' => $altTypeSlug,
                        'slug' => $slug,
                    ]);
                }
            }
        }
        $data['message_form'] = $message_form->createView();
        $data['hasSalaries'] = $this->getDoctrine()
            ->getRepository('GovWikiDbBundle:Salary')
            ->has($data['government']['id'], $data['government']['currentYear']);
        $data['hasPensions'] = $this->getDoctrine()
            ->getRepository('GovWikiDbBundle:Pension')
            ->has($data['government']['id'], $data['government']['currentYear']);

        $data['environment_is_subscribable'] = $environment->getSubscribable();

        $issueForm = $this->createForm('document', null, [
            'action' => $this->generateUrl('govwiki_api_v1_government_issue', [
                'government' => $data['government']['id'],
            ]),
        ]);
        $data['issueForm'] = $issueForm->createView();

        $commentForm = $this->createFormBuilder(
            [ 'comment' => $data['government']['comment'] ],
            [ 'attr' => [ 'id' => 'comment-form' ] ]
        )
            ->add('comment', 'ckeditor', [
                'config_name' => 'elected_official_bio',
                'label' => false,
            ])
            ->getForm();
        $data['commentForm'] = $commentForm->createView();


        if ($request->query->has('new')) {
            return $this->render('@GovWikiFrontend/Government/index_new.html.twig', $data);
        }
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
