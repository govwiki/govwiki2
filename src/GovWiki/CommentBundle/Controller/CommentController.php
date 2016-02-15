<?php

namespace GovWiki\CommentBundle\Controller;

use GovWiki\CommentBundle\Entity\VoteComment;
use GovWiki\CommentBundle\Form\VoteCommentType;
use GovWiki\CommentBundle\GovWikiCommentServices;
use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Class CommentController
 * @package GovWiki\CommentBundle\Controller
 *
 * @Configuration\Route("/comment")
 */
class CommentController extends Controller
{

    /**
     * @Configuration\Route("/")
     * @Configuration\Template()
     *
     * @param Request $request A Request instance.
     *
     * @return array
     *
     * @throws NotFoundHttpException Comment key not provided.
     * @throws \GovWiki\DbBundle\Exception\UnknownKeyException Can't find
     * comment key.
     */
    public function addAction(Request $request)
    {
        /*
         * Require comment key in query parameter.
         */
        $key = $request->query->get('key', null);
        if (null === $key) {
            throw new NotFoundHttpException();
        }

        $manager = $this->get(GovWikiCommentServices::COMMENT_KEY_MANAGER);
        $vote = $manager->getEntity($key);

        $comment = new VoteComment();
        $comment->setSubject($vote);

        $form = $this->createForm(new VoteCommentType(), $comment);

        if ($form->isSubmitted() && $form->isValid()) {
            $em = $this->getDoctrine()->getManager();

            $vote->addComment($comment);
            $em->persist($vote);
            $em->flush();

            $manager->remove($key);
        }

        return [
            'form' => $form->createView(),
            'vote' => $vote,
        ];
    }
}
