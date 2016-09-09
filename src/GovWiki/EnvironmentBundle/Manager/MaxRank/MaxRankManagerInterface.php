<?php

namespace GovWiki\EnvironmentBundle\Manager\MaxRank;

use GovWiki\DbBundle\Entity\Environment;

/**
 * Interface MaxRankManagerInterface
 * @package GovWiki\EnvironmentBundle\Manager\MaxRank
 */
interface MaxRankManagerInterface
{

    /**
     * Compute and persist to database new max ranks values for all ranked
     * fields in each alt type groups ('City', 'County' and etc.) in given
     * environment.
     *
     * @param Environment $environment A Environment entity instance.
     * @param array       $fields      Array of fields.
     * @param integer     $year        Data year.
     *
     * @return void
     *
     * @throws \Doctrine\DBAL\DBALException SQL error while update max ranks.
     */
    public function computeAndSave(
        Environment $environment,
        array $fields,
        $year
    );

    /**
     * Get max ranks for given environment.
     *
     * @param Environment $environment A Environment entity instance.
     * @param string      $altTypeSlug Government alt type.
     * @param integer     $year        Data year.
     *
     * @return array|boolean
     */
    public function get(
        Environment $environment,
        $altTypeSlug,
        $year
    );

    /**
     * @param Environment $environment A Environment entity instance.
     *
     * @return void
     *
     * @throws \Doctrine\DBAL\DBALException SQL error while removing.
     */
    public function removeTable(Environment $environment);
}
