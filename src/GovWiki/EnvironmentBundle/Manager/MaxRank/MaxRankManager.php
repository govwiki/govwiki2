<?php

namespace GovWiki\EnvironmentBundle\Manager\MaxRank;

use Doctrine\DBAL\DBALException;
use Doctrine\ORM\EntityManagerInterface;
use GovWiki\DbBundle\Entity\Environment;
use GovWiki\EnvironmentBundle\Strategy\DefaultNamingStrategy;

/**
 * Class MaxRankManager
 * @package GovWiki\EnvironmentBundle\MaxRank
 */
class MaxRankManager implements MaxRankManagerInterface
{

    /**
     * @var EntityManagerInterface
     */
    private $em;

    /**
     * @param EntityManagerInterface $em A EntityManagerInterface instance.
     */
    public function __construct(EntityManagerInterface $em)
    {
        $this->em = $em;
    }

    /**
     * {@inheritdoc}
     */
    public function computeAndSave(
        Environment $environment,
        array $fields,
        $year
    ) {
        $fields = array_filter(
            $fields,
            function (array $field) {
                return $field['ranked'] === true;
            }
        );

        // Prepare column definition for table creation.
        $columnDefinitions = array_map(
            function (array $field) {
                return "{$field['field']} FLOAT DEFAULT NULL";
            },
            $fields
        );
        $columnDefinitions = implode(',', $columnDefinitions);

        // Prepare insert statement.
        $insertParts = array_map(
            function (array $field) {
                $name = $field['field'];
                $rankName = DefaultNamingStrategy::rankedFieldName($name);
                return "MAX(e.{$rankName}) AS {$name}";
            },
            $fields
        );
        $insertParts = implode(',', $insertParts);

        // Prepare update statement, for duplicate entities.
        $updateParts = array_map(
            function (array $field) {
                return "{$field['field']} = new.{$field['field']}";
            },
            $fields
        );
        $updateParts = implode(',', $updateParts);

        $con = $this->em->getConnection();
        $maxRankTableName = DefaultNamingStrategy::maxRanksTableName(
            $environment
        );
        $governmentTableName = DefaultNamingStrategy::environmentRelatedTableName(
            $environment
        );

        // Create max ranks table if it don't created yet.
        $con->exec("
            CREATE TABLE IF NOT EXISTS `{$maxRankTableName}`
            (
                alt_type_slug VARCHAR(255) NOT NULL,
                year int(4) NOT NULL,
                {$columnDefinitions},
                CONSTRAINT pk_max_ranks PRIMARY KEY (`year`, alt_type_slug)
            ) DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
        ");

        // Try to insert new values or if they already here, update it.
        $con->exec("
            INSERT INTO `{$maxRankTableName}`
            SELECT new.*
            FROM
            (
                SELECT
                    g.alt_type_slug AS alt_type_slug,
                    {$year} AS year,
                    {$insertParts}
                FROM `{$governmentTableName}` e
                INNER JOIN governments g ON e.government_id = g.id
                WHERE
                    g.environment_id = '{$environment->getId()}' AND
                    e.year = {$year}
                GROUP BY g.alt_type_slug
            ) AS new
            ON DUPLICATE KEY UPDATE
                {$updateParts}
        ");
    }

    /**
     * {@inheritdoc}
     */
    public function get(
        Environment $environment,
        $altTypeSlug,
        $year
    ) {
        $tableName = DefaultNamingStrategy::maxRanksTableName(
            $environment
        );

        try {
            $data = $this->em->getConnection()->fetchAssoc("
                SELECT m.*
                FROM {$tableName} m
                WHERE m.alt_type_slug = '{$altTypeSlug}'
            ");
        } catch (DBALException $e) {
            return false;
        }

        // Remove useless fields.
        unset($data['alt_type_slug'], $data['environment_id']);

        return $data;
    }

    /**
     * {@inheritdoc}
     */
    public function removeTable(Environment $environment)
    {
        $tableName = DefaultNamingStrategy::maxRanksTableName($environment);
        $this->em->getConnection()->exec("DROP TABLE IF EXISTS `{$tableName}``");
    }
}
