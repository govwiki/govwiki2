<?php

namespace GovWiki\CommentBundle\Controller;

use GovWiki\CommentBundle\Entity\VoteComment;
use GovWiki\CommentBundle\Form\VoteCommentType;
use GovWiki\CommentBundle\GovWikiCommentServices;
use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use GovWiki\AdminBundle\GovWikiAdminServices;

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
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $em = $this->getDoctrine()->getManager();

            $comment->setElected($vote->getElectedOfficial());
            $em->persist($comment);
            $em->flush();

            $manager->remove($key);

            // send admin notification
            $mailer = $this->get('swiftmailer.mailer');
            $message = \Swift_Message::newInstance();

            if ($this->getParameter('debug')) {
                $message->setTo('user1@mail1.dev');
                $setFrom = explode('@', 'user1@mail1.dev');
                $setFrom = 'robot@'.$setFrom[1];
            } else {
                $adminEmail = $this->adminEnvironmentManager()->getEntity()->getAdminEmail();
                $message->setTo($adminEmail);
                $setFrom = explode('@', $adminEmail);
                $setFrom = 'robot@'.$setFrom[1];
            }

            $message
                ->setSubject('Elected official added a comment')
                ->setFrom($setFrom)
                ->setBody(
                    $this->renderView(
                        '@GovWikiComment/Email/admin_notification.html.twig',
                        [
                            'electedName'        => $vote->getElectedOfficial()->getFullName(),
                            'government'         => $vote->getElectedOfficial()->getGovernment()->getName(),
                            'electedTitle'       => $vote->getElectedOfficial()->getTitle(),
                            'summaryLegislation' => $vote->getLegislation()->getSummary(),
                            'commentText'        => $comment->getBody(),
                        ]
                    ),
                    'text/html'
                );

            $mailer->send($message);

            return $this
                ->render('@GovWikiComment/Comment/add_complete.html.twig');
        }

        return [
            'form' => $form->createView(),
            'vote' => $vote,
        ];
    }

    /**
     * @return \GovWiki\AdminBundle\Manager\AdminEnvironmentManager
     */
    protected function adminEnvironmentManager()
    {
        return $this->get(GovWikiAdminServices::ADMIN_ENVIRONMENT_MANAGER);
    }
}
