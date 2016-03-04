<?php

namespace GovWiki\AdminBundle\Controller;

use GovWiki\AdminBundle\Form\TemplateForm;
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

        $template = $this->getDoctrine()
            ->getRepository('GovWikiAdminBundle:Template')
            ->getVoteEmailTemplate($manager->getEnvironment());

        $form = $this->createForm(new TemplateForm(), $template);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $em = $this->getDoctrine()->getManager();
            $em->persist($template);
            $em->flush();
        }

        return [ 'form' => $form->createView() ];
    }
}
