<?php

namespace GovWiki\AdminBundle\Controller;

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
     * @Template()
     */
    public function homeAction()
    {
        return [];
    }
}
