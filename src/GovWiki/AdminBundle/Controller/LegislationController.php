<?php

namespace GovWiki\AdminBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;
use Symfony\Component\HttpFoundation\Request;
use GovWiki\DbBundle\Entity\Legislation;
use GovWiki\DbBundle\Form\LegislationType;

/**
 * LegislationController
 *
 * @Configuration\Route("/{environment}/legislation")
 */
class LegislationController extends Controller
{
    /**
     * @Configuration\Route("/", methods="GET")
     * @Configuration\Template()
     *
     * @param Request $request     A Request instance.
     * @param string  $environment Environment name.
     *
     * @return array
     */
    public function indexAction(Request $request, $environment)
    {
        $legislations = $this->get('knp_paginator')->paginate(
            $this->getDoctrine()->getRepository('GovWikiDbBundle:Legislation')
                ->getListQuery($environment),
            $request->query->getInt('page', 1),
            50
        );

        return [
            'legislations' => $legislations,
            'environment' => $environment,
        ];
    }

    /**
     * @Configuration\Route("/create")
     * @Configuration\Template()
     *
     * @param Request $request     A Request instance.
     * @param string  $environment Environment name.
     *
     * @return array
     */
    public function createAction(Request $request, $environment)
    {
        $legislation = new Legislation();

        $form = $this->createForm(new LegislationType($environment), $legislation);
        $form->handleRequest($request);

        if ($form->isValid()) {
            $em = $this->getDoctrine()->getManager();

            $em->persist($legislation);
            $em->flush();
            $this->addFlash('admin_success', 'New legislation created');

            return $this->redirectToRoute('govwiki_admin_legislation_index');
        }

        return [
            'form' => $form->createView(),
            'environment' => $environment,
        ];
    }

    /**
     * @Configuration\Route("/{id}/edit", requirements={"id": "\d+"})
     * @Configuration\Template()
     *
     * @param string      $environment Environment name.
     * @param Legislation $legislation A Legislation instance.
     * @param Request     $request     A Request instance.
     *
     * @return array
     */
    public function editAction($environment, Legislation $legislation, Request $request)
    {
        $form = $this->createForm(new LegislationType($environment), $legislation);
        $form->handleRequest($request);

        if ($form->isValid()) {
            $this->getDoctrine()->getManager()->flush();
            $this->addFlash('admin_success', 'Legislation updated');

            return $this->redirectToRoute('govwiki_admin_legislation_index');
        }

        return [
            'form' => $form->createView(),
            'environment' => $environment,
        ];
    }
}
