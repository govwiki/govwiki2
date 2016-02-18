<?php

namespace GovWiki\AdminBundle\Controller;

use GovWiki\AdminBundle\GovWikiAdminServices;
use GovWiki\ApiBundle\GovWikiApiServices;
use GovWiki\CommentBundle\GovWikiCommentServices;
use GovWiki\DbBundle\Entity\ElectedOfficial;
use GovWiki\DbBundle\Entity\ElectedOfficialVote;
use GovWiki\DbBundle\Entity\Legislation;
use GovWiki\DbBundle\Entity\Repository\ElectedOfficialRepository;
use GovWiki\RequestBundle\Entity\AbstractCreateRequest;
use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\RouterInterface;

/**
 * Class CreateRequestController
 * @package GovWiki\AdminBundle\Controller
 *
 * @Configuration\Route("/create-request")
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
        $createRequests = $this->paginate(
            $this->getManager()->getListQuery(),
            $request->query->getInt('page', 1),
            50
        );

        return [ 'createRequests' => $createRequests ];
    }

    /**
     * @Configuration\Route("/{id}")
     *
     * @Configuration\ParamConverter(
     *  "createRequest",
     *  class="GovWiki\RequestBundle\Entity\AbstractCreateRequest",
     *  options={ "repository_method": "getOne" }
     * )
     *
     * @param Request               $request       A Request instance.
     * @param AbstractCreateRequest $createRequest A AbstractCreateRequest
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
        $em = $this->getDoctrine()->getManager();

        $type = $createRequest->getFormType();
        $form = $this->createForm($type, $createRequest->getSubject());
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            if ($request->request->has('discard')) {
                /*
                 * Discard current create request.
                 */
                $createRequest
                    ->setStatus(AbstractCreateRequest::STATE_DISCARDED);

                $em->persist($createRequest);
            } else {
                /*
                 * Apply current create request.
                 */
                $createRequest
                    ->setStatus(AbstractCreateRequest::STATE_APPLIED);
                $em->persist($createRequest);

                $electedIds = $request->request->get('send_email', []);
                if (count($electedIds) > 0) {
                    $this->sendEmails($electedIds, $createRequest);
                }
            }

            $em->flush();
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
     * @Configuration\Route("/{id}/remove")
     *
     * @param AbstractCreateRequest $createRequest A CreateRequest instance.
     *
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function removeAction(AbstractCreateRequest $createRequest)
    {
        $em = $this->getDoctrine()->getManager();
        $em->remove($createRequest);
        $em->flush();

        return $this->redirectToRoute('govwiki_admin_createrequest_index');
    }

    /**
     * @param integer[] $electedList List of Elected Officials ids.
     *
     * @return void
     */
    private function sendEmails(array $electedList, AbstractCreateRequest $createRequest)
    {
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

            $template = 'GovWikiAdminBundle::email.html.twig';
            $parameters = [
                'full_name' => $row['fullName'],
                'title' => $row['title'],
                'type' => $type,
                'email' => $this->getParameter('admin_email'),
                'government_name' => $row['name'],
                'profileUrl' => $govwikiRouter->generate(
                    'elected',
                    [
                        'altTypeSlug' => $row['altTypeSlug'],
                        'slug' => $row['government_slug'],
                        'electedSlug' => $row['elected_slug'],
                    ],
                    RouterInterface::ABSOLUTE_URL
                ),
            ];

            if ('vote' === $type) {
                $template = 'GovWikiAdminBundle:Template/Email:vote.html.twig';
                $vote =
                    $this->getVote($createRequest->getSubject(), $row['id']);
                $key = $commentKeyManager->create($vote);
                $parameters['vote'] = $vote;
                $parameters['key'] = $key->getKey();
                $parameters['addCommentUrl'] = $govwikiRouter
                    ->generate(
                        'govwiki_comment_comment_add',
                        [ ],
                        RouterInterface::ABSOLUTE_URL
                    );

                $this->getDoctrine()->getManager()->persist($key);
            }

            $message
                ->setSubject($this->getParameter('email_subject'))
                ->setFrom($this->getParameter('admin_email'))
                ->setBody(
                    $this->renderView(
                        $template,
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

    /**
     * @return \GovWiki\AdminBundle\Manager\Entity\AdminCreateRequestManager
     */
    private function getManager()
    {
        return $this->get(GovWikiAdminServices::CREATE_REQUEST_MANAGER);
    }
}
