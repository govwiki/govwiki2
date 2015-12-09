<?php

namespace GovWiki\AdminBundle\Controller;

use GovWiki\DbBundle\Entity\Map;
use GovWiki\DbBundle\Form\MapType;
use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class MapController
 * @package GovWiki\AdminBundle\Controller
 *
 * @Configuration\Route("/map")
 */
class MapController extends Controller
{
    /**
     * @Configuration\Route("/", name="map_list")
     * @Configuration\Template()
     *
     * @param Request $request A Request instance.
     *
     * @return array
     */
    public function listAction(Request $request)
    {
        return [
            'maps' => $this->get('knp_paginator')->paginate(
                $this->repository()->listQuery(),
                $request->query->getInt('page', 1),
                10
            ),
        ];
    }

    /**
     * @Configuration\Route("/{name}", name="map_show")
     * @Configuration\Template()
     *
     * @param Request $request A Request instance.
     * @param string  $name    Map name.
     *
     * @return array
     */
    public function editAction(Request $request, $name)
    {
        $map = $this->repository()->get($name);
        $form = $this->createForm(new MapType(), $map);

        $form->handleRequest($request);
        $form = $this->processForm($form);

        return [
            'form' => $form->createView(),
            'name' => $name,
        ];
    }

    /**
     * @Configuration\Route("/new", name="map_new")
     * @Configuration\Template()
     *
     * @param Request $request A Request instance.
     *
     * @return array
     */
    public function newAction(Request $request)
    {
        $map = new Map();
        $form = $this->createForm(new MapType(), $map);

        $form->handleRequest($request);
        $form = $this->processForm($form);

        return [
            'form' => $form->createView(),
        ];
    }

    /**
     * @param FormInterface $form A FormInterface instance.
     *
     * @return FormInterface
     */
    private function processForm(FormInterface $form)
    {
        if ($form->isSubmitted() && $form->isValid()) {
            $em = $this->getDoctrine()->getManager();
            $em->persist($form->getData());
            $em->flush();
        }

        return $form;
    }

    /**
     * @return \GovWiki\DbBundle\Entity\Repository\MapRepository
     */
    private function repository()
    {
        return $this->getDoctrine()->getRepository('GovWikiDbBundle:Map');
    }
}
