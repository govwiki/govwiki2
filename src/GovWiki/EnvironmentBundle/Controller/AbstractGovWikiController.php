<?php

namespace GovWiki\EnvironmentBundle\Controller;

use GovWiki\EnvironmentBundle\GovWikiEnvironmentService;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;

/**
 * Class AbstractGovWikiController
 * @package GovWiki\EnvironmentBundle\Controller
 */
abstract class AbstractGovWikiController extends Controller
{

    /**
     * Return current environment.
     *
     * @return \GovWiki\DbBundle\Entity\Environment
     */
    protected function getCurrentEnvironment()
    {
        return $this->get(GovWikiEnvironmentService::STORAGE)->get();
    }

    /**
     * @return \GovWiki\EnvironmentBundle\Manager\EnvironmentManager
     */
    protected function getEnvironmentManager()
    {
        return $this->get(GovWikiEnvironmentService::MANAGER);
    }
}
