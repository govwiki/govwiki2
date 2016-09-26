<?php

namespace GovWiki\EnvironmentBundle\Manager\Rank;

use Doctrine\DBAL\DBALException;
use Doctrine\ORM\EntityManagerInterface;
use GovWiki\DbBundle\Entity\Environment;
use GovWiki\EnvironmentBundle\Manager\Format\FormatManagerInterface;
use GovWiki\EnvironmentBundle\Manager\Government\GovernmentManagerInterface;
use GovWiki\EnvironmentBundle\Manager\MaxRank\MaxRankManagerInterface;
use GovWiki\EnvironmentBundle\Strategy\GovwikiNamingStrategy;

/**
 * Class RankManager
 * @package GovWiki\EnvironmentBundle\Rank
 */
class RankManager implements RankManagerInterface
{

    /**
     * @var FormatManagerInterface
     */
    private $formatManager;

    /**
     * @var GovernmentManagerInterface
     */
    private $governmentManager;

    /**
     * @var MaxRankManagerInterface
     */
    private $maxRankManager;

    /**
     * @param FormatManagerInterface     $formatManager     A FormatManagerInterface
     *                                                      instance.
     * @param GovernmentManagerInterface $governmentManager A GovernmentManagerInterface
     *                                                      instance.
     * @param MaxRankManagerInterface    $maxRankManager    A MaxRankManagerInterface
     *                                                      instance.
     */
    public function __construct(
        FormatManagerInterface $formatManager,
        GovernmentManagerInterface $governmentManager,
        MaxRankManagerInterface $maxRankManager
    ) {
        $this->formatManager = $formatManager;
        $this->governmentManager = $governmentManager;
        $this->maxRankManager = $maxRankManager;
    }

    /**
     * Compute and persist to database new ranks values.
     *
     * @param Environment $environment A Environment entity instance.
     *
     * @return void
     *
     * @throws \Doctrine\DBAL\DBALException SQL error while update max ranks.
     */
    public function compute(Environment $environment)
    {
        $formats = $this->formatManager->get($environment, true);
        // Get list of ranked field.
        $rankedFilterFn = function (array $format) {
            return $format['ranked'];
        };
        $formats = array_values(array_filter($formats, $rankedFilterFn));

        // Get all available years for environment.
        $availableYears = $this->governmentManager->getAvailableYears($environment);

        foreach ($availableYears as $year) {
            foreach ($formats as $format) {
                $this->governmentManager->calculateRanks($environment, $format, $year);
            }
        }

        // Some strange error occurred then recalculate ranks on production.
        // For some reasons ranks calculate not correct for first field, but if
        // we calculate it again in th end, all ok.
        $this->governmentManager
            ->calculateRanks($environment, $formats[0], $availableYears[0]);

        // Drop max ranks table.
        $this->maxRankManager->removeTable($environment);
    }
}
