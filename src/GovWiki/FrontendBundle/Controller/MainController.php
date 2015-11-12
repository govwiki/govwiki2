<?php

namespace GovWiki\FrontendBundle\Controller;

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
     * @Template("GovWikiFrontendBundle:Main:legacy.html.php")
     *
     * @return array
     */
    public function mapAction()
    {
        return [];
    }

    /**
     * @Route("/{altTypeSlug}/{slug}")
     * @Template("GovWikiFrontendBundle:Main:legacy.html.php")
     *
     * @return array
     */
    public function governmentAction()
    {
        return [];
    }

    /**
     * @Route("/rank_order")
     * @Template("GovWikiFrontendBundle:Main:legacy.html.php")
     *
     * @return array
     */
    public function rankOrderAction()
    {
        return [];
    }

    /**
     * @Route("/{govAltTypeSlug}/{govSlug}/{eoSlug}")
     * @Template("GovWikiFrontendBundle:Main:legacy.html.php")
     *
     * @return array
     */
    public function electedOfficialAction()
    {
        return [];
    }
}
