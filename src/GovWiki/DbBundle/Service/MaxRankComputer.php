<?php

namespace GovWiki\DbBundle\Service;

use Doctrine\ORM\EntityManagerInterface;
use GovWiki\DbBundle\Entity\Repository\FormatRepository;

/**
 * Class MaxRankComputer
 * @package GovWiki\DbBundle\Service
 */
class MaxRankComputer implements MaxRankComputerInterface
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
    public function compute($environment, $year)
    {
        /** @var FormatRepository $repository */
        $formatRepository = $this->em->getRepository('GovWikiDbBundle:Format');
        $rankedFieldList = $formatRepository->getRankedFields($environment);

        $rankedFieldList = array_map(
            function (array $element) {
                return $element['field'];
            },
            $rankedFieldList
        );

        $columnDefinitions = array_map(
            function ($element) {
                return "{$element} FLOAT DEFAULT NULL";
            },
            $rankedFieldList
        );
        $columnDefinitions = implode(',', $columnDefinitions);

        $insertParts = array_map(
            function ($element) {
                return "MAX(e.{$element}_rank) AS {$element}";
            },
            $rankedFieldList
        );
        $insertParts = implode(',', $insertParts);

        $updateParts = array_map(
            function ($element) {
                return "{$element} = new.{$element}";
            },
            $rankedFieldList
        );
        $updateParts = implode(',', $updateParts);

        $con = $this->em->getConnection();
        $tableName = self::getTableName($environment);

        $con->exec("
            CREATE TABLE IF NOT EXISTS `{$tableName}`
            (
                alt_type_slug VARCHAR(255) NOT NULL,
                year int(4) NOT NULL,
                {$columnDefinitions},
                PRIMARY KEY (`year`)
            ) DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
        ");

        $con->exec("
            INSERT INTO `{$tableName}`
            SELECT new.*
            FROM
            (
                SELECT
                    g.alt_type_slug AS alt_type_slug,
                    {$year} AS year,
                    {$insertParts}
                FROM `{$environment}` e
                INNER JOIN governments g ON e.government_id = g.id
                INNER JOIN environments env ON g.environment_id = env.id
                WHERE
                    env.slug = '{$environment}' AND
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
    public static function getTableName($environment)
    {
        return "{$environment}_max_ranks";
    }
}
