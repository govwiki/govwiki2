<?php

namespace GovWiki\AdminBundle\Controller;

use GovWiki\DbBundle\Entity\Repository\LegislationRepository;
use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;
use Symfony\Component\HttpFoundation\Request;
use GovWiki\DbBundle\Entity\Legislation;

/**
 * Class LegislationController
 * @package GovWiki\AdminBundle\Controller
 *
 * @Configuration\Route(
 *  "/{environment}/legislation",
 *  requirements={ "environment": "\w+" }
 * )
 */
class LegislationController extends AbstractGovWikiAdminController
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
        /** @var LegislationRepository $repository */
        $repository = $this->getDoctrine()
            ->getRepository('GovWikiDbBundle:Legislation');

        $legislations = $repository->getListQuery(
            $this->getCurrentEnvironment()->getId()
        );

        $legislations = $this->get('knp_paginator')->paginate(
            $legislations,
            $request->query->getInt('page', 1),
           25
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
        /** @var Legislation $legislation */
        $legislation = new Legislation();

        $form = $this->createForm('govwiki_dbbundle_legislation', $legislation);
        $form->handleRequest($request);

        if ($form->isValid()) {
            $em = $this->getDoctrine()->getManager();
            $em->persist($legislation);
            $em->flush();

            $this->successMessage('Legislation created');

            return $this->redirectToRoute('govwiki_admin_legislation_index', [
                'environment' => $this->getCurrentEnvironment()->getSlug(),
            ]);
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
        $form = $this->createForm('govwiki_dbbundle_legislation', $legislation);
        $form->handleRequest($request);

        if ($form->isValid()) {
            $em = $this->getDoctrine()->getManager();
            $em->persist($legislation);
            $em->flush();

            $this->successMessage('Legislation '. $legislation->getId() .' updated');

            return $this->redirectToRoute('govwiki_admin_legislation_index', [
                'environment' => $this->getCurrentEnvironment()->getSlug(),
            ]);
        }

        return [
            'form' => $form->createView(),
            'legislation' => $legislation,
        ];
    }

    /**
     * @Configuration\Route(
     *  "/{id}/remove",
     *  requirements={"id": "\d+"}
     * )
     *
     * @param Legislation $legislation A Legislation entity instance.
     *
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function removeAction(Legislation $legislation)
    {
        $em = $this->getDoctrine()->getManager();

        $em->remove($legislation);
        $em->flush();

        return $this->redirectToRoute('govwiki_admin_legislation_index', [
            'environment' => $this->getCurrentEnvironment()->getSlug(),
        ]);
    }
}
