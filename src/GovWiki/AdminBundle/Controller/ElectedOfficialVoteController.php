<?php

namespace GovWiki\AdminBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use GovWiki\DbBundle\Entity\ElectedOfficial;
use GovWiki\DbBundle\Entity\ElectedOfficialVote;
use GovWiki\DbBundle\Entity\Legislation;

/**
 * ElectedOfficialVoteController all actions use xmlHttpRequest, and partials as default template
 */
class ElectedOfficialVoteController extends Controller
{


    /**
     * @Route("/electedofficial/{id}/vote/create")
     * @Template("GovWikiAdminBundle:ElectedOfficial:_create_vote_modal.html.twig")
     *
     * @param ElectedOfficial $electedOfficial
     * @param Request         $request
     * @return Response|JsonResponse
     */
    public function createAction(ElectedOfficial $electedOfficial, Request $request)
    {
        if ($request->isXmlHttpRequest()) {
            $em = $this->getDoctrine()->getManager();
            $issueCategories = $em->getRepository('GovWikiDbBundle:IssueCategory')->findAll();

            if ($request->getMethod() == 'POST') {

                $vote = new ElectedOfficialVote;
                $voteData = $request->request->get('vote');
                $vote->setElectedOfficial($electedOfficial)
                     ->setVote($voteData['vote'])
                     ->setDidElectedOfficialProposeThis($voteData['didElectedOfficialProposeThis']);

                $legislationType = $request->request->get('legislationType');
                if ($legislationType == 'existing') {
                    $vote->setLegislation($em->getRepository('GovWikiDbBundle:Legislation')->find($voteData['legislation']));
                } elseif ($legislationType == 'new') {
                    $legislation = new Legislation;
                    $legislationData = $request->request->get('legislation');
                    foreach ($legislationData as $field => $value) {
                        if ($field != 'issueCategory') {
                            if ($field == 'dateConsidered') {
                                $value = new \DateTime($value);
                            }
                            $setter = 'set'.ucfirst($field);
                            $legislation->$setter($value);
                        } else {
                            $legislation->setIssueCategory($em->getRepository('GovWikiDbBundle:IssueCategory')->find($value));
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
                'action'          => $this->generateUrl('govwiki_admin_electedofficialvote_create', ['id' => $electedOfficial->getId()]),
            ];
        } else {
            return new Response(null, 400);
        }
    }

    /**
     * @Route("/electedofficialvote/{id}/edit")
     * @Template("GovWikiAdminBundle:ElectedOfficial:_edit_vote_modal.html.twig")
     *
     * @param Request             $request
     * @param ElectedOfficialVote $vote
     * @return Response|JsonResponse
     */
    public function editAction(Request $request, ElectedOfficialVote $vote)
    {
        if ($request->getMethod() == 'POST') {
            $vote->setVote($request->request->get('vote'))
                 ->setDidElectedOfficialProposeThis($request->request->get('didElectedOfficialProposeThis'));

            $this->getDoctrine()->getManager()->flush();

            return new JsonResponse(['reload' => true]);
        }

        return [
            'vote'   => $vote,
            'action' => $this->generateUrl('govwiki_admin_electedofficialvote_edit', ['id' => $vote->getId()]),
        ];
    }

    /**
     * @Route("/electedofficialvote/{id}/remove")
     *
     * @param ElectedOfficialVote $vote
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
