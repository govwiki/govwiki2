<?php

namespace GovWiki\AdminBundle\Controller;

use GovWiki\DbBundle\Entity\Format;
use GovWiki\DbBundle\Form\FormatType;
use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class FormatController
 * @package GovWiki\AdminBundle\Controller
 *
 * @Configuration\Route("/{environment}/format")
 */
class FormatController extends Controller
{
    /**
     * @Configuration\Route("/")
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
     * @Configuration\Route("/{id}/edit")
     * @Configuration\Template()
     *
     * @param Request $request     A Request instance.
     * @param string  $environment Environment name.
     * @param Format  $format      A Format instance.
     *
     * @return array
     */
    public function editAction(Request $request, $environment, Format $format)
    {
        $form = $this->createForm(new FormatType(), $format);
        $form->handleRequest($request);
        $this->processForm($form);

        return [
            'form' => $form->createView(),
            'environment' => $environment,
        ];
    }

    /**
     * @Configuration\Route("/new")
     * @Configuration\Template()
     *
     * @param Request $request     A Request instance.
     * @param string  $environment Environment name.
     *
     * @return array|\Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function newAction(Request $request, $environment)
    {
        $format = new Format();
        $format->setEnvironment(
            $this->getDoctrine()->getRepository('GovWikiDbBundle:Environment')
                ->getReferenceByName($environment)
        );

        $form = $this->createForm(new FormatType(), $format);
        $form->handleRequest($request);
        $this->processForm($form);

        return [
            'form' => $form->createView(),
            'environment' => $environment,
        ];
        //return $this->redirectToRoute('');
    }

    /**
     * @Configuration\Route("/{id}/delete")
     *
     * @param Request $request     A Request instance.
     * @param string  $environment Environment name.
     * @param Format  $format      A Format instance.
     *
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function removeAction($environment, Format $format)
    {
        $em = $this->getDoctrine()->getManager();
        $em->remove($format);
        $em->flush();

        return new JsonResponse([
            'redirect' => $this->generateUrl(
                'govwiki_admin_editrequest_index',
                [ 'environment' => $environment ]
            )
        ]);
    }

    /**
     * @param FormInterface $form A FormInterface instance.
     *
     * @return void
     */
    private function processForm(FormInterface $form)
    {
        if ($form->isSubmitted() && $form->isValid()) {
            $em = $this->getDoctrine()->getManager();
            $em->persist($form->getData());
            $em->flush();
        }
    }
}
