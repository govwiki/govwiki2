<?php

namespace GovWiki\AdminBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpFoundation\Request;
use GovWiki\DbBundle\Entity\Legislation;
use GovWiki\DbBundle\Form\LegislationType;

/**
 * LegislationController
 */
class LegislationController extends Controller
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

        $legislations = $this->get('knp_paginator')->paginate(
            $em->createQuery('SELECT l FROM GovWikiDbBundle:Legislation l'),
            $request->query->getInt('page', 1),
            50
        );

        return ['legislations' => $legislations];
    }

    /**
     * @Route("/create", methods="GET|POST")
     * @Template()
     *
     * @param Request    $request
     * @return Response
     */
    public function createAction(Request $request)
    {
        $legislation = new Legislation;

        $form = $this->createForm(new LegislationType(), $legislation);
        $form->handleRequest($request);

        if ($form->isValid()) {
            $em = $this->getDoctrine()->getManager();

            $em->persist($legislation);
            $em->flush();
            $this->addFlash('info', 'Created');

            return $this->redirectToRoute('govwiki_admin_legislation_index');
        }

        return ['form' => $form->createView()];
    }

    /**
     * @Route("/{id}/edit", methods="GET|POST", requirements={"id": "\d+"})
     * @Template()
     *
     * @param Legislation $legislation
     * @param Request    $request
     * @return Response
     */
    public function editAction(Legislation $legislation, Request $request)
    {
        $form = $this->createForm(new LegislationType(), $legislation);
        $form->handleRequest($request);

        if ($form->isValid()) {
            $this->getDoctrine()->getManager()->flush();
            $this->addFlash('info', 'Saved');

            return $this->redirectToRoute('govwiki_admin_legislation_index');
        }

        return ['form' => $form->createView()];
    }
}
