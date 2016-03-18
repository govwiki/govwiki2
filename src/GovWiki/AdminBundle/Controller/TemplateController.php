<?php

namespace GovWiki\AdminBundle\Controller;

use GovWiki\AdminBundle\Form\TemplateForm;
use GovWiki\AdminBundle\Form\Type\DelayType;
use GovWiki\AdminBundle\GovWikiAdminServices;
use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class TemplateController
 * @package GovWiki\AdminBundle\Controller
 *
 * @Configuration\Route("/templates")
 */
class TemplateController extends Controller
{

    /**
     * @Configuration\Route("/")
     * @Configuration\Template()
     *
     * @param Request $request A Request instance.
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function indexAction(Request $request)
    {
        $manager = $this->get(GovWikiAdminServices::ADMIN_ENVIRONMENT_MANAGER);

        $environment = $manager->getEntity();
        $template = $this->getDoctrine()
            ->getRepository('GovWikiAdminBundle:Template')
            ->getVoteEmailTemplate($manager->getEnvironment());

        $form = $this->createFormBuilder([
            'template' => $template->getContent(),
            'delay' => $environment->getLegislationDisplayTime(),
        ])
            ->add('template', 'ckeditor', [
                'config' => [ 'entities' => false ],
            ])
            ->add('delay', new DelayType())
            ->getForm();

        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $em = $this->getDoctrine()->getManager();
            $data = $form->getData();
            $data['delay'] = array_map(
                function ($element) { return (int) $element; },
                $data['delay']
            );

            $template->setContent($data['template']);
            $environment->setLegislationDisplayTime($data['delay']);

            $em->persist($template);
            $em->persist($environment);
            $em->flush();
        }

        return [ 'form' => $form->createView() ];
    }
}
