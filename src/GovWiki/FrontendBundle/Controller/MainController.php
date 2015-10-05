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
     * @return Response
     */
    public function mapAction()
    {
        return [];
    }

    /**
     * @Route("/{altTypeSlug}/{slug}")
     * @Template("GovWikiFrontendBundle:Main:legacy.html.php")
     *
     * @return Response
     */
    public function governmentAction()
    {
        return [];
    }

    /**
     * @Route("/{govAltTypeSlug}/{govSlug}/{eoSlug}")
     * @Template("GovWikiFrontendBundle:Main:legacy.html.php")
     *
     * @return Response
     */
    public function electedOfficialAction()
    {
        return [];
    }
}
