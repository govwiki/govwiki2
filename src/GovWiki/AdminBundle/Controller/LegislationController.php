<?php

namespace GovWiki\AdminBundle\Controller;

use GovWiki\AdminBundle\GovWikiAdminServices;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;
use Symfony\Component\HttpFoundation\Request;
use GovWiki\DbBundle\Entity\Legislation;
use GovWiki\DbBundle\Form\LegislationType;

/**
 * Class LegislationController
 * @package GovWiki\AdminBundle\Controller
 *
 * @Configuration\Route("/legislation")
 */
class LegislationController extends Controller
{
    /**
     * @Configuration\Route("/")
     * @Configuration\Template()
     *
     * @param Request $request A Request instance.
     *
     * @return array
     */
    public function indexAction(Request $request)
    {
        $legislations = $this->get('knp_paginator')->paginate(
            $this->getManager()->getListQuery(),
            $request->query->getInt('page', 1),
            50
        );

        return [ 'legislations' => $legislations ];
    }

    /**
     * @Configuration\Route("/create")
     * @Configuration\Template()
     *
     * @param Request $request A Request instance.
     *
     * @return array
     */
    public function createAction(Request $request)
    {
        $manager = $this->getManager();
        /** @var Legislation $legislation */
        $legislation = $manager->create();

        $form = $this->createForm(
            new LegislationType($this->getManager()->getEnvironment()),
            $legislation
        );
        $form->handleRequest($request);

        if ($form->isValid()) {
            $manager->update($legislation);
            $this->addFlash('admin_success', 'New legislation created');

            return $this->redirectToRoute('govwiki_admin_legislation_index');
        }

        return [ 'form' => $form->createView() ];
    }

    /**
     * @Configuration\Route(
     *  "/{id}/edit",
     *  requirements={"id": "\d+"}
     * )
     * @Configuration\Template()
     *
     * @param Request     $request     A Request instance.
     * @param Legislation $legislation A Legislation instance.
     *
     * @return array
     */
    public function editAction(Request $request, Legislation $legislation)
    {
        $form = $this->createForm(
            new LegislationType($this->getManager()->getEnvironment()),
            $legislation
        );
        $form->handleRequest($request);

        if ($form->isValid()) {
            $this->getManager()->update($legislation);
            $this->addFlash('admin_success', 'Legislation updated');

            return $this->redirectToRoute('govwiki_admin_legislation_index');
        }

        return [ 'form' => $form->createView() ];
    }

    /**
     * @return \GovWiki\AdminBundle\Manager\Entity\AdminLegislationManager
     */
    public function getManager()
    {
        return $this->get(GovWikiAdminServices::LEGISLATION_MANAGER);
    }
}
