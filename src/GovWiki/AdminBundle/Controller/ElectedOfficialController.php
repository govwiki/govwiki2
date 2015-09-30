<?php

namespace GovWiki\AdminBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use GovWiki\DbBundle\Entity\ElectedOfficial;
use GovWiki\DbBundle\Entity\ElectedOfficialVote;
use GovWiki\DbBundle\Entity\Legislation;
use GovWiki\DbBundle\Form\ElectedOfficialType;

/**
 * ElectedOfficialController
 */
class ElectedOfficialController extends Controller
{
    /**
     * @Route("/", methods="GET")
     * @Template()
     *
     * @param Request $request
     * @return Response
     */
    public function indexAction(Request $request)
    {
        $em = $this->getDoctrine()->getManager();

        $qb = $em->createQueryBuilder()->select('eo')->from('GovWikiDbBundle:ElectedOfficial', 'eo')->leftJoin('eo.government', 'g');

        if ($filter = $request->query->get('filter')) {
            if (!empty($filter['id'])) {
                $qb->andWhere('eo.id = :id')->setParameter('id', $filter['id']);
            }
            if (!empty($filter['fullName'])) {
                $qb->andWhere('eo.fullName LIKE :fullName')->setParameter('fullName', '%'.$filter['fullName'].'%');
            }
            if (!empty($filter['governmentName'])) {
                $qb->andWhere('g.name LIKE :governmentName')->setParameter('governmentName', '%'.$filter['governmentName'].'%');
            }
        }

        $electedOfficials = $this->get('knp_paginator')->paginate(
            $qb->getQuery(),
            $request->query->getInt('page', 1),
            50
        );

        return ['electedOfficials' => $electedOfficials];
    }

    /**
     * @Route("/create", methods="GET|POST")
     * @Template()
     *
     * @param Request $request
     * @return Response
     */
    public function createAction(Request $request)
    {
        $electedOfficial = new ElectedOfficial;

        $form = $this->createForm(new ElectedOfficialType(), $electedOfficial);
        $form->handleRequest($request);

        if ($form->isValid()) {
            $em = $this->getDoctrine()->getManager();

            $em->persist($electedOfficial);
            $em->flush();
            $this->addFlash('info', 'Created');

            return $this->redirectToRoute('govwiki_admin_electedofficial_index');
        }

        return ['form' => $form->createView()];
    }

    /**
     * @Route("/{id}/edit", methods="GET|POST", requirements={"id": "\d+"})
     * @Template()
     *
     * @param ElectedOfficial $electedOfficial
     * @param Request         $request
     * @return Response
     */
    public function editAction(ElectedOfficial $electedOfficial, Request $request)
    {
        $form = $this->createForm(new ElectedOfficialType(), $electedOfficial);
        $form->handleRequest($request);

        if ($form->isValid()) {
            $this->getDoctrine()->getManager()->flush();
            $this->addFlash('info', 'Saved');

            return $this->redirectToRoute('govwiki_admin_electedofficial_index');
        }

        return ['form' => $form->createView(), 'electedOfficial' => $electedOfficial];
    }
}
