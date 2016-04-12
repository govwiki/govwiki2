<?php

namespace GovWiki\EnvironmentBundle\Manager\Data\MaxRank;

/**
 * Interface MaxRankManagerInterface
 * @package GovWiki\EnvironmentBundle\Manager\Data\MaxRank
 */
interface MaxRankManagerInterface
{


    /**
     * Compute and persist to database new max ranks values for all ranked
     * fields in each alt type groups ('City', 'County' and etc.) in given
     * environment.
     *
     * @param string $maxRankTableName    Environment max rank data table name.
     * @param string $governmentTableName Environment specific government data
     * @param array  $rankedColumns       List of ranked column names.
     *
     * @return mixed
     *
     * @throws \Doctrine\DBAL\DBALException Error while update max ranks.
     */
    public function computeAndSave(
        $maxRankTableName,
        $governmentTableName,
        array $rankedColumns
    );

    /**
     * Get max ranks for given environment.
     *
     * @param string $maxRankTableName    Environment max rank data table name.
     * @param string $governmentTableName Environment specific government data
     *                                    table name.
     * @param string $altTypeSlug         Government slugged alt type.
     *
     * @return array
     *
     * @throws \Doctrine\DBAL\DBALException Given max rank table name not exists.
     */
    public function get($maxRankTableName, $governmentTableName, $altTypeSlug);

    /**
     * @param string $tableName Environment specific government data
     *                          table name.
     *
     * @return void
     */
    public function removeTable($tableName);
}
