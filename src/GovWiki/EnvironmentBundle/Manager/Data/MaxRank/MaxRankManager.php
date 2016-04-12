<?php

namespace GovWiki\EnvironmentBundle\Manager\Data\MaxRank;

use GovWiki\EnvironmentBundle\Manager\Data\AbstractDataManager;

/**
 * Class MaxRankManager
 * @package GovWiki\EnvironmentBundle\Data\MaxRank
 */
class MaxRankManager extends AbstractDataManager implements
    MaxRankManagerInterface
{

    /**
     * {@inheritdoc}
     */
    public function computeAndSave(
        $maxRankTableName,
        $governmentTableName,
        array $rankedColumns
    ) {
        $sqlPart = implode(',', $rankedColumns);

        $con = $this->em->getConnection();

        $con->exec("DROP TABLE IF EXISTS {$maxRankTableName}");
        $con->exec("
            CREATE TABLE `{$maxRankTableName}`
            (
                SELECT
                    g.alt_type_slug AS alt_type_slug,
                    g.environment_id AS environment_id,
                    {$sqlPart}
                FROM {$governmentTableName} e
                INNER JOIN governments g ON e.government_id = g.id
                GROUP BY g.alt_type_slug
            )
        ");
    }

    /**
     * {@inheritdoc}
     */
    public function get($maxRankTableName, $governmentTableName, $altTypeSlug)
    {
        $data = $this->em->getConnection()->fetchAssoc("
            SELECT m.*
            FROM {$maxRankTableName} m
            INNER JOIN environments e ON m.environment_id = e.id
            WHERE
                e.slug = '{$governmentTableName}' AND
                m.alt_type_slug = '{$altTypeSlug}'
        ");

        /*
         * Remove useless fields.
         */
        unset($data['alt_type_slug'], $data['environment_id']);

        /*
         * Set proper field name
         */

        return $data;
    }

    /**
     * {@inheritdoc}
     */
    public function removeTable($tableName)
    {
        $this->em->getConnection()->exec("DROP TABLE IF EXISTS `{$tableName}``");
    }
}
