<?php

namespace GovWiki\EnvironmentBundle\Manager\Data;

use GovWiki\EnvironmentBundle\Manager\Data\Format\FormatManagerInterface;
use GovWiki\EnvironmentBundle\Manager\Data\Government\GovernmentManagerInterface;
use GovWiki\EnvironmentBundle\Manager\Data\MaxRank\MaxRankManagerInterface;

/**
 * Interface DataManagerPoolInterface
 * @package GovWiki\EnvironmentBundle\Manager\Data
 */
interface DataManagerPoolInterface
{

    /**
     * @return MaxRankManagerInterface
     */
    public function getMaxRankManager();

    /**
     * @return GovernmentManagerInterface;
     */
    public function getGovernmentManager();
}
