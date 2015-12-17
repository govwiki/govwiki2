<?php

namespace GovWiki\AdminBundle\Controller;

use GovWiki\AdminBundle\GovWikiAdminServices;
use GovWiki\DbBundle\Entity\Format;
use GovWiki\DbBundle\Form\AbstractGroupType;
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
 * @Configuration\Route("/format")
 */
class FormatController extends Controller
{
    /**
     * @Configuration\Route("/")
     * @Configuration\Template()
     *
     * @param Request $request A Request instance.
     *
     * @return array
     */
    public function listAction(Request $request)
    {
        $fields = $this->get('knp_paginator')->paginate(
            $this->getManager()->getListQuery(),
            $request->query->getInt('page', 1),
            25
        );

        $form = $this->createForm(new AbstractGroupType());

        return [
            'fields' => $fields,
            'form' => $form->createView(),
        ];
    }

    /**
     * @Configuration\Route("/{id}/edit")
     * @Configuration\Template()
     *
     * @param Request $request A Request instance.
     * @param Format  $format  A Format instance.
     *
     * @return array
     */
    public function editAction(Request $request, Format $format)
    {
        $form = $this->createForm(new FormatType(), $format);
        $form->handleRequest($request);
        $this->processForm($form);

        return [ 'form' => $form->createView() ];
    }

    /**
     * @Configuration\Route("/new")
     * @Configuration\Template()
     *
     * @param Request $request A Request instance.
     *
     * @return array|\Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function newAction(Request $request)
    {
        $format = $this->getManager()->create();

        $form = $this->createForm(new FormatType(), $format);
        $form->handleRequest($request);
        $this->processForm($form);

        return [ 'form' => $form->createView() ];
    }

    /**
     * @Configuration\Route("/{id}/delete")
     *
     * @param Format $format A Format instance.
     *
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function removeAction(Format $format)
    {
        $em = $this->getDoctrine()->getManager();
        $em->remove($format);
        $em->flush();

        return new JsonResponse([
            'redirect' => $this->generateUrl(
                'govwiki_admin_editrequest_index'
            ),
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
            $this->getManager()->update($form->getData());
        }
    }

    /**
     * @return \GovWiki\AdminBundle\Manager\Entity\AdminFormatManager
     */
    private function getManager()
    {
        return $this->get(GovWikiAdminServices::FORMAT_MANAGER);
    }

    /**
     * Delete after migration.
     */
    private function updateFieldsInFormats() {

        $em = $this->getDoctrine()->getManager();
        $result = $em->getRepository('GovWikiDbBundle:Format')->findAll();

        foreach($result as $key => $value) {
            $str = $value->getField();
            $parts = explode('_', $str);

            $str = $parts[0];
            for ($i = 1; $i < count($parts); $i++) {
                $str .= ucfirst($parts[$i]);
            }

            $value->setField($str);

            $em->persist($value);
            $em->flush();

        }

    }
}
