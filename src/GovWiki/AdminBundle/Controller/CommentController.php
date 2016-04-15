<?php

namespace GovWiki\AdminBundle\Controller;

use GovWiki\AdminBundle\GovWikiAdminServices;
use GovWiki\CommentBundle\Entity\VoteComment;
use GovWiki\CommentBundle\Form\VoteCommentType;
use GovWiki\DbBundle\Entity\ElectedOfficial;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\HttpFoundation\Request;
use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;

/**
 * Class CommentController
 * @package GovWiki\AdminBundle\Controller
 *
 * @Configuration\Route("/{elected}", requirements={ "elected": "\d+" })
 */
class CommentController extends AbstractGovWikiAdminController
{

    const MAX_COMMENTS = 15;

    /**
     * @Configuration\Route("/")
     * @Configuration\Template()
     *
     * @param Request         $request A Request instance.
     * @param ElectedOfficial $elected A ElectedOfficial entity instance.
     *
     * @return array
     */
    public function listAction(Request $request, ElectedOfficial $elected)
    {
        $comments = $this->getDoctrine()->getRepository('GovWikiCommentBundle:VoteComment')
            ->getListQuery($elected->getId());

        return [
            'comments' => $this->paginate(
                $comments,
                $request->query->getInt('page', 1),
                self::MAX_COMMENTS
            ),
            'elected'  => $elected,
        ];
    }

    /**
     * @Configuration\Route("/{comment}/remove", requirements={ "comment": "\d+" })
     *
     * @param VoteComment $comment A VoteComment instance.
     * @param integer     $elected A ElectedOfficial entity id.
     *
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function removeAction(VoteComment $comment, $elected)
    {
        $em = $this->getDoctrine()->getManager();

        $em->remove($comment);
        $em->flush();

        return $this->redirectToRoute('govwiki_admin_comment_list', [
            'elected' => $elected,
        ]);
    }

    /**
     * @Configuration\Route("/new")
     * @Configuration\Template
     *
     * @param Request         $request A Request instance.
     * @param ElectedOfficial $elected A ElectedOfficial entity instance.
     *
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function newAction(Request $request, ElectedOfficial $elected)
    {
        /** @var VoteComment $comment */
        $comment = $this->getManager()->create();
        $comment->setElected($elected);
        $form = $this->createForm(new VoteCommentType(true), $comment);
        if ($this->processForm($request, $form)) {
            return $this->redirectToRoute('govwiki_admin_comment_list', [
                'elected' => $elected->getId(),
            ]);
        }

        return [
            'form' => $form->createView(),
            'elected' => $elected,
        ];
    }

    /**
     * @Configuration\Route("/{comment}/edit", requirements={ "comment": "\d+" })
     * @Configuration\Template
     *
     * @param Request         $request A Request instance.
     * @param ElectedOfficial $elected A ElectedOfficial entity instance.
     * @param VoteComment     $comment A VoteComment entity instance.
     *
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function editAction(
        Request $request,
        ElectedOfficial $elected,
        VoteComment $comment
    ) {
        $form = $this->createForm(new VoteCommentType(), $comment);
        if ($this->processForm($request, $form)) {
            return $this->redirectToRoute('govwiki_admin_comment_list', [
                'elected' => $elected->getId(),
            ]);
        }

        return [
            'form' => $form->createView(),
            'elected' => $elected,
        ];
    }

    /**
     * @param Request       $request A Request instance.
     * @param FormInterface $form    A Form instance.
     *
     * @return boolean
     */
    private function processForm(Request $request, FormInterface $form)
    {
        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            $this->getManager()->update($form->getData());

            return true;
        }

        return false;
    }

    /**
     * @return \GovWiki\AdminBundle\Manager\Entity\AdminCommentManager
     */
    private function getManager()
    {
        return $this->get(GovWikiAdminServices::COMMENT_MANAGER);
    }
}
