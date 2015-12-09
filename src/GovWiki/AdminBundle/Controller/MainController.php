<?php

namespace GovWiki\AdminBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;

/**
 * MainController
 */
class MainController extends Controller
{
    /**
     * @Configuration\Route("/")
     * @Configuration\Template()
     *
     * @return array
     */
    public function homeAction()
    {
        return [];
    }
}
