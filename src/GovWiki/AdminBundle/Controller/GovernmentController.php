<?php

namespace GovWiki\AdminBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpFoundation\Request;
use GovWiki\DbBundle\Entity\Government;
use GovWiki\DbBundle\Form\GovernmentType;

/**
 * GovernmentController
 */
class GovernmentController extends Controller
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

        $governments = $this->get('knp_paginator')->paginate(
            $em->createQuery('SELECT g FROM GovWikiDbBundle:Government g'),
            $request->query->getInt('page', 1),
            50
        );

        return ['governments' => $governments];
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
        $government = new Government;

        $form = $this->createForm(new GovernmentType(), $government);
        $form->handleRequest($request);

        if ($form->isValid()) {
            $em = $this->getDoctrine()->getManager();

            $em->persist($government);
            $em->flush();
            $this->addFlash('info', 'Created');

            return $this->redirectToRoute('govwiki_admin_government_index');
        }

        return ['form' => $form->createView()];
    }

    /**
     * @Route("/{id}/edit", methods="GET|POST", requirements={"id": "\d+"})
     * @Template()
     *
     * @param Government $government
     * @param Request    $request
     * @return Response
     */
    public function editAction(Government $government, Request $request)
    {
        $form = $this->createForm(new GovernmentType(), $government);
        $form->handleRequest($request);

        if ($form->isValid()) {
            $this->getDoctrine()->getManager()->flush();
            $this->addFlash('info', 'Saved');

            return $this->redirectToRoute('govwiki_admin_government_index');
        }

        return ['form' => $form->createView()];
    }
}
