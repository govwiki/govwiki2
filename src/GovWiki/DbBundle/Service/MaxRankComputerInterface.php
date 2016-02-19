<?php

namespace GovWiki\DbBundle\Service;

use Doctrine\ORM\EntityManagerInterface;
use GovWiki\DbBundle\Entity\MaxRank;
use GovWiki\DbBundle\Entity\Repository\GovernmentRepository;

/**
 * Interface MaxRankComputerInterface
 * @package GovWiki\DbBundle\Service
 */
interface MaxRankComputerInterface
{
    /**
     * Compute and persist to database new max ranks values for all ranked
     * fields in each alt types group ('City', 'Count' and etc.) in given
     * environment.
     *
     * @param string $environment Environment slug.
     *
     * @return void
     */
    public function compute($environment);

    /**
     * Return max ranks table name for given environment.
     *
     * @param string $environment Environment slug.
     *
     * @return string
     */
    public static function getTableName($environment);
}
