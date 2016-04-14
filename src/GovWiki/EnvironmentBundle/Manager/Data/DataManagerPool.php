<?php

namespace GovWiki\EnvironmentBundle\Manager\Data;

use GovWiki\EnvironmentBundle\Manager\Data\Format\FormatManagerInterface;
use GovWiki\EnvironmentBundle\Manager\Data\MaxRank\MaxRankManagerInterface;
use GovWiki\EnvironmentBundle\Manager\Data\Government\GovernmentManagerInterface;

/**
 * Class DataManagerPool
 * @package GovWiki\EnvironmentBundle\Manager\Data
 */
class DataManagerPool implements DataManagerPoolInterface
{

    /**
     * @var MaxRankManagerInterface
     */
    private $maxRankManager;

    /**
     * @var GovernmentManagerInterface
     */
    private $governmentManager;

    /**
     * @param MaxRankManagerInterface    $maxRankManager    A MaxRankManagerInterface
     *                                                      instance.
     * @param GovernmentManagerInterface $governmentManager A GovernmentManagerInterface
     *                                                      instance.
     */
    public function __construct(
        MaxRankManagerInterface $maxRankManager,
        GovernmentManagerInterface $governmentManager
    ) {
        $this->maxRankManager = $maxRankManager;
        $this->governmentManager = $governmentManager;
    }

    /**
     * {@inheritdoc}
     */
    public function getMaxRankManager()
    {
        return $this->maxRankManager;
    }

    /**
     * {@inheritdoc}
     */
    public function getGovernmentManager()
    {
        return $this->governmentManager;
    }
}
