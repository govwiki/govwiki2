<?php

namespace GovWiki\FrontendBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\Security\Core\User\UserInterface;

/**
 * MainController
 */
class GovernmentController extends Controller
{

    /**
     * @Route("/{altTypeSlug}/{slug}")
     * @Template("GovWikiFrontendBundle:Government:index.html.twig")
     *
     * @return array
     */
    public function governmentAction($altTypeSlug, $slug)
    {

        $em = $this->getDoctrine()->getManager();

        $government = $em->getRepository('GovWikiDbBundle:Government')->findOneBy(['altTypeSlug'=>$altTypeSlug, 'slug'=>$slug]);

        return ['government' => $government];
    }


}
