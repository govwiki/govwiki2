<?php

namespace GovWiki\AdminBundle\Controller;

use GovWiki\AdminBundle\Entity\Repository\TemplateRepository;
use GovWiki\ApiBundle\GovWikiApiServices;
use GovWiki\CommentBundle\GovWikiCommentServices;
use GovWiki\CommentBundle\Manager\CommentKeyManager;
use GovWiki\DbBundle\Entity\ElectedOfficialVote;
use GovWiki\DbBundle\Entity\Legislation;
use GovWiki\DbBundle\Entity\Repository\ElectedOfficialRepository;
use GovWiki\RequestBundle\Entity\AbstractCreatable;
use GovWiki\RequestBundle\Entity\AbstractCreateRequest;
use GovWiki\RequestBundle\Entity\LegislationCreateRequest;
use GovWiki\RequestBundle\Entity\Repository\CreateRequestRepository;
use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\RouterInterface;

/**
 * Class CreateRequestController
 * @package GovWiki\AdminBundle\Controller
 *
 * @Configuration\Route(
 *  "/{environment}/create-request",
 *  requirements={ "environment": "\w+" }
 * )
 */
class CreateRequestController extends AbstractGovWikiAdminController
{
    /**
     * @Configuration\Route("/")
     * @Configuration\Template
     *
     * @param Request $request A Request instance.
     *
     * @return array
     *
     * @throws \LogicException Some required bundle not registered.
     */
    public function indexAction(Request $request)
    {
        if ($this->getCurrentEnvironment() === null) {
            return $this->redirectToRoute('govwiki_admin_main_home');
        }

        /** @var CreateRequestRepository $repository */
        $repository = $this->getDoctrine()
            ->getRepository('GovWikiRequestBundle:AbstractCreateRequest');

        $createRequests = $repository
            ->getListQuery($this->getCurrentEnvironment()->getId());

        $createRequests = $this->paginate(
            $createRequests,
            $request->query->getInt('page', 1),
            50
        );

        return [ 'createRequests' => $createRequests ];
    }

    /**
     * @Configuration\Route(
     *  "/{id}",
     *  requirements={ "id": "\d+" }
     * )
     *
     * @Configuration\ParamConverter(
     *  "createRequest",
     *  class="GovWiki\RequestBundle\Entity\AbstractCreateRequest",
     *  options={ "repository_method": "getOne" }
     * )
     *
     * @param Request               $request       A Request instance.
     * @param AbstractCreateRequest $createRequest A AbstractCreateRequest entity
     *                                             instance.
     *
     * @return Response
     *
     * @throws \LogicException Some required bundle not registered.
     * @throws \InvalidArgumentException Invalid entity manager name.
     */
    public function showAction(
        Request $request,
        AbstractCreateRequest $createRequest
    ) {
        if ($this->getCurrentEnvironment() === null) {
            return $this->redirectToRoute('govwiki_admin_main_home');
        }

        $environment = $this->getCurrentEnvironment();
        $em = $this->getDoctrine()->getManager();

        $type = $createRequest->getFormType();
        $form = $this->createForm($type, $createRequest->getSubject());
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            if ($request->request->has('discard')) {
                // Discard current create request.
                $createRequest
                    ->setStatus(AbstractCreateRequest::STATE_DISCARDED);

                $em->persist($createRequest);
            } else {
                // Apply current create request.

                $createRequest
                    ->setStatus(AbstractCreateRequest::STATE_APPLIED);

                if ($createRequest instanceof LegislationCreateRequest) {
                    // Set display time for applied legislation.

                    $delay = $environment->getLegislationDisplayTime();

                    if (null !== $delay) {
                        /** @var Legislation $subject */
                        $subject = $createRequest->getSubject();

                        $hours = $delay['hours'];
                        $minutes = $delay['minutes'];
                        $interval = new \DateInterval("PT{$hours}H{$minutes}M");

                        $displayTime = new \DateTime();
                        $displayTime = $displayTime->add($interval);
                        $subject->setDisplayTime($displayTime);

                        $createRequest->setSubject($subject);
                        $em->persist($subject);
                    }
                }

                $em->persist($createRequest);

                $electedIds = $request->request->get('send_email', []);
                if (count($electedIds) > 0) {
                    $this->sendEmails($electedIds, $createRequest);
                }
            }

            $em->flush();

            return $this->redirectToRoute('govwiki_admin_createrequest_index', [
                'environment' => $environment->getSlug(),
            ]);
        }

        $templateName = strtolower(str_replace(
            ' ',
            '_',
            $createRequest->getEntityName()
        ));

        return $this->render(
            "@GovWikiAdmin/CreateRequest/{$templateName}.html.twig",
            [
                'form' => $form->createView(),
                'createRequest' => $createRequest,
            ]
        );
    }

    /**
     * @Configuration\Route(
     *  "/{id}/remove",
     *  requirements={ "id": "\d+" }
     * )
     *
     * @param AbstractCreateRequest $request A AbstractCreateRequest entity
     *                                       instance.
     *
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function removeAction(AbstractCreateRequest $request)
    {
        if ($this->getCurrentEnvironment() === null) {
            return $this->redirectToRoute('govwiki_admin_main_home');
        }

        $em = $this->getDoctrine()->getManager();

        /** @var AbstractCreatable $subject */
        $subject = $request->getSubject();
        $subject->setRequest(null);

        $em->persist($subject);
        $em->remove($request);
        $em->flush();

        return $this->redirectToRoute('govwiki_admin_createrequest_index', [
            'environment' => $this->getCurrentEnvironment()->getSlug(),
        ]);
    }

    /**
     * @param integer[] $electedList List of Elected Officials ids.
     *
     * @return void
     */
    private function sendEmails(array $electedList, AbstractCreateRequest $createRequest)
    {
        $domain = $this->getCurrentEnvironment()->getDomain();

        /** @var CommentKeyManager $commentKeyManager */
        $commentKeyManager = $this
            ->get(GovWikiCommentServices::COMMENT_KEY_MANAGER);
        $govwikiRouter = $this
            ->get(GovWikiApiServices::URL_GENERATOR);
        $mailer = $this
            ->get('swiftmailer.mailer');

        $type = 'public statement';
        if ($createRequest->getEntityName() === 'Legislation') {
            $type = 'vote';
        }

        /** @var ElectedOfficialRepository $repository */
        $repository = $this->getDoctrine()
            ->getRepository('GovWikiDbBundle:ElectedOfficial');

        $data = $repository->getDataForEmailByIds($electedList);

        foreach ($data as $row) {
            $message = \Swift_Message::newInstance();
            if ($this->getParameter('debug')) {
                $message->setTo('user1@mail1.dev');
            } else {
                $message->setTo($row['emailAddress']);
            }
            error_log('Send to '. json_encode($message->getTo()));

            $template = 'GovWikiAdminBundle::email.html.twig';
            $parameters = [
                'full_name' => $row['fullName'],
                'title' => $row['title'],
                'type' => $type,
                'email' => $this->getCurrentEnvironment()->getAdminEmail(),
                'government_name' => $row['name'],
                'profileUrl' => "http://{$domain}".$govwikiRouter->generate(
                    'elected',
                    [
                        'altTypeSlug' => $row['altTypeSlug'],
                        'slug' => $row['government_slug'],
                        'electedSlug' => $row['elected_slug'],
                    ]
                ),
            ];
            $engine = $this->get('twig');

            if ('vote' === $type) {
                /** @var TemplateRepository $repository */
                $repository = $this->getDoctrine()
                    ->getRepository('GovWikiAdminBundle:Template');

                $template = $repository
                    ->getVoteEmailTemplate(
                        $this->getCurrentEnvironment()->getSlug()
                    );
                $vote =
                    $this->getVote($createRequest->getSubject(), $row['id']);
                $key = $commentKeyManager->create($vote);
                $parameters['vote'] = $vote;
                $parameters['key'] = $key->getKey();
                $parameters['addCommentUrl'] = "http://{$domain}".$govwikiRouter
                    ->generate(
                        'govwiki_comment_comment_add'
                    );

                $this->getDoctrine()->getManager()->persist($key);

                $engine = clone $engine;
                $engine->setLoader(new \Twig_Loader_String());
            }

            $message
                ->setSubject($this->getParameter('email_subject'))
                ->setFrom($this->getCurrentEnvironment()->getAdminEmail())
                ->setBody(
                    $engine->render(
                        $template->getContent(),
                        $parameters
                    ),
                    'text/html'
                );

            $mailer->send($message);
        }
    }

    /**
     * @param Legislation $legislation       A Legislation instance.
     * @param integer     $electedOfficialId Elected official id.
     *
     * @return ElectedOfficialVote|null
     */
    private function getVote(Legislation $legislation, $electedOfficialId)
    {
        /** @var ElectedOfficialVote $vote */
        foreach ($legislation->getElectedOfficialVotes() as $vote) {
            if ($vote->getElectedOfficial()->getId() === $electedOfficialId) {
                return $vote;
            }
        }

        return null;
    }
}
