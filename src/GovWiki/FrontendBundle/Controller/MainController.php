<?php

namespace GovWiki\FrontendBundle\Controller;

use GovWiki\ApiBundle\GovWikiApiServices;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;

/**
 * MainController
 */
class MainController extends Controller
{
    /**
     * @Route("/")
     * @Template("GovWikiFrontendBundle:Home:home.html.twig")
     *
     * @return array
     */
    public function mapAction()
    {
        return [
            'map' => $this->get(GovWikiApiServices::ENVIRONMENT_MANAGER)
                ->getMap(),
        ];
    }
}
