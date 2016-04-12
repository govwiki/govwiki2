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
     * @var FormatManagerInterface
     */
    private $formatManager;

    /**
     * @param MaxRankManagerInterface    $maxRankManager    A MaxRankManagerInterface
     *                                                      instance.
     * @param GovernmentManagerInterface $governmentManager A GovernmentManagerInterface
     *                                                      instance.
     * @param FormatManagerInterface     $formatManager     A FormatManagerInterface
     *                                                      instance.
     */
    public function __construct(
        MaxRankManagerInterface $maxRankManager,
        GovernmentManagerInterface $governmentManager,
        FormatManagerInterface $formatManager
    ) {
        $this->maxRankManager = $maxRankManager;
        $this->governmentManager = $governmentManager;
        $this->formatManager = $formatManager;
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

    /**
     * {@inheritdoc}
     */
    public function getFormatManager()
    {
        return $this->formatManager;
    }
}
