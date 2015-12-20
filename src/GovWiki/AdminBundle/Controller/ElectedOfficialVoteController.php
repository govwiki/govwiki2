<?php

namespace GovWiki\AdminBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use GovWiki\DbBundle\Entity\ElectedOfficial;
use GovWiki\DbBundle\Entity\ElectedOfficialVote;
use GovWiki\DbBundle\Entity\Legislation;
use Symfony\Component\HttpFoundation\Response;

/**
 * ElectedOfficialVoteController all actions use xmlHttpRequest, and partials as
 * default template.
 *
 * @package GovWiki\AdminBundle\Controller
 */
class ElectedOfficialVoteController extends Controller
{


    /**
     * @Configuration\Route(
     *  "/elected-official/{id}/vote/create",
     *  requirements={"id": "\d+"}
     * )
     * @Configuration\Template("GovWikiAdminBundle:ElectedOfficial:_create_vote_modal.html.twig")
     *
     * @param Request         $request         A Request instance.
     * @param ElectedOfficial $electedOfficial A ElectedOfficial instance.
     *
     * @return array|JsonResponse
     */
    public function createAction(
        Request $request,
        ElectedOfficial $electedOfficial
    ) {
        if ($request->isXmlHttpRequest()) {
            $em = $this->getDoctrine()->getManager();

            $categoryRepository = $em
                ->getRepository('GovWikiDbBundle:IssueCategory');
            $issueCategories = $categoryRepository->findAll();

            if ($request->getMethod() === 'POST') {
                $vote = new ElectedOfficialVote();
                $voteData = $request->request->get('vote');
                $vote->setElectedOfficial($electedOfficial)
                     ->setVote($voteData['vote'])
                     ->setDidElectedOfficialProposeThis(
                         $voteData['didElectedOfficialProposeThis']
                     );

                $legislationType = $request->request->get('legislationType');
                if ($legislationType === 'existing') {
                    $vote->setLegislation($em
                        ->getRepository('GovWikiDbBundle:Legislation')
                        ->find($voteData['legislation'])
                    );
                } elseif ($legislationType === 'new') {
                    $legislation = new Legislation();
                    $legislationData = $request->request->get('legislation');
                    foreach ($legislationData as $field => $value) {
                        if ($field !== 'issueCategory') {
                            if ($field === 'dateConsidered') {
                                $value = new \DateTime($value);
                            }
                            $setter = 'set'.ucfirst($field);
                            $legislation->$setter($value);
                        } else {
                            $legislation->setIssueCategory(
                                $categoryRepository->find($value)
                            );
                        }
                    }
                    $em->persist($legislation);
                    $vote->setLegislation($legislation);
                }
                $em->persist($vote);
                $em->flush();

                return new JsonResponse(['reload' => true]);
            }

            return [
                'electedOfficial' => $electedOfficial,
                'issueCategories' => $issueCategories,
                'action'          => $this->generateUrl(
                    'govwiki_admin_electedofficialvote_create',
                    ['id' => $electedOfficial->getId()]
                ),
            ];
        } else {
            return new Response(null, 400);
        }
    }

    /**
     * @Configuration\Route(
     *  "/elected-official-vote/{id}/edit",
     *  requirements={"id": "\d+"}
     * )
     * @Configuration\Template("GovWikiAdminBundle:ElectedOfficial:_edit_vote_modal.html.twig")
     *
     * @param Request             $request A Request instance.
     * @param ElectedOfficialVote $vote    A ElectedOfficialVote instance.
     *
     * @return Response|JsonResponse
     */
    public function editAction(Request $request, ElectedOfficialVote $vote)
    {
        if ($request->getMethod() === 'POST') {
            $vote->setVote($request->request->get('vote'))
                 ->setDidElectedOfficialProposeThis(
                     $request->request->get('didElectedOfficialProposeThis')
                 );

            $this->getDoctrine()->getManager()->flush();

            return new JsonResponse(['reload' => true]);
        }

        return [
            'vote'   => $vote,
            'action' => $this->generateUrl(
                'govwiki_admin_electedofficialvote_edit',
                ['id' => $vote->getId()]
            ),
        ];
    }

    /**
     * @Configuration\Route(
     *  "/elected-official-vote/{id}/remove",
     *  requirements={"id": "\d+"}
     * )
     *
     * @param ElectedOfficialVote $vote A ElectedOfficialVote instance.
     *
     * @return JsonResponse
     */
    public function removeAction(ElectedOfficialVote $vote)
    {
        $em = $this->getDoctrine()->getManager();
        $em->remove($vote);
        $em->flush();

        return new JsonResponse(['status' => 'ok']);
    }
}
