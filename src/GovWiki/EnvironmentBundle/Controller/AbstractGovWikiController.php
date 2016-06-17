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
     * @return \GovWiki\EnvironmentBundle\Manager\ElectedOfficial\ElectedOfficialManager
     */
    protected function getElectedOfficialManager()
    {
        return $this->get(GovWikiEnvironmentService::ELECTED_OFFICIAL_MANAGER);
    }

    /**
     * @return \GovWiki\EnvironmentBundle\Manager\Government\GovernmentManager
     */
    protected function getGovernmentManager()
    {
        return $this->get(GovWikiEnvironmentService::GOVERNMENT_MANAGER);
    }

    /**
     * @return \GovWiki\EnvironmentBundle\Manager\Format\FormatManager
     */
    protected function getFormatManager()
    {
        return $this->get(GovWikiEnvironmentService::FORMAT_MANAGER);
    }

    /**
     * @return \GovWiki\EnvironmentBundle\Manager\MaxRank\MaxRankManager
     */
    protected function getMaxRankManager()
    {
        return $this->get(GovWikiEnvironmentService::MAX_RANK_MANAGER);
    }
}
