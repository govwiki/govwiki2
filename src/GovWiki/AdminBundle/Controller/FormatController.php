<?php

namespace GovWiki\AdminBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class FormatController
 * @package GovWiki\AdminBundle\Controller
 *
 * @Configuration\Route("/format/{environment}")
 */
class FormatController extends Controller
{
    /**
     * @Configuration\Route("/", name="government_format")
     * @Configuration\Template()
     *
     * @param Request $request     A Request instance.
     * @param string  $environment Environment environment.
     *
     * @return array
     */
    public function listAction(Request $request, $environment)
    {
        $fields = $this->get('knp_paginator')->paginate(
            $this->getDoctrine()->getRepository('GovWikiDbBundle:Format')
                ->getListQuery($environment),
            $request->query->getInt('page', 1),
            25
        );

        return [
            'environment' => $environment,
            'fields' => $fields,
        ];
    }

    /**
     * @Configuration\Route("/edit", name="government_format_edit")
     * @Configuration\Template()
     *
     * @param $environment
     * @param $id
     *
     * @return array
     */
    public function editAction($environment, $id)
    {
        return [];
    }

    /**
     * @Configuration\Route("/new", name="government_format_new")
     * @Configuration\Template()
     *
     * @param $environment
     *
     * @return array|\Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function newAction($environment)
    {
        return $this->redirectToRoute('government_format');
    }

    /**
     * @Configuration\Route("/delete", name="government_format_delete")
     *
     * @param $environment
     * @param $id
     *
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function removeAction($environment, $id)
    {
        return $this->redirectToRoute('government_format',[
            'environment' => $environment,
        ]);
    }

    /**
     * @param FormInterface $form
     *
     * @return void
     */
    private function processForm(FormInterface $form)
    {

    }
}
