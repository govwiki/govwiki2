<?php

namespace GovWiki\AdminBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;

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
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function indexAction()
    {
        $emailTemplate = $this
            ->getTemplateFile('GovWikiAdminBundle::email.html.twig');

        $data = [
            'voteEmail' => file_get_contents($emailTemplate),
        ];

        $form = $this->createFormBuilder($data)
            ->add('voteEmail', 'ckeditor')
            ->getForm();

        return [ 'form' => $form->createView() ];
    }

    /**
     * @param string $templateName Template name in 'bundle:directory:template'
     *                             notation.
     *
     * @return string
     */
    private function getTemplateFile($templateName)
    {
        $templateNameParser = $this->get('templating.name_parser');
        $locator = $this->get('templating.locator');

        return $locator->locate($templateNameParser->parse($templateName));
    }
}
