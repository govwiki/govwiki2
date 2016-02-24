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
    public function compute($environment)
    {
        /** @var FormatRepository $repository */
        $formatRepository = $this->em->getRepository('GovWikiDbBundle:Format');
        $rankedFieldList = $formatRepository->getRankedFields($environment);

        $makeSqlPart = function ($element) {
            $element = $element['field'];
            return "MAX(e.{$element}_rank) AS {$element}";
        };
        $rankedFieldList = array_map($makeSqlPart, $rankedFieldList);
        $sql = implode(',', $rankedFieldList);

        $con = $this->em->getConnection();
        $tableName = self::getTableName($environment);

        $con->exec("DROP TABLE IF EXISTS {$tableName}");
        $con->exec("
            CREATE TABLE `{$tableName}`
            (
                SELECT
                    g.alt_type_slug AS alt_type_slug,
                    g.environment_id AS environment_id,
                    {$sql}
                FROM {$environment} e
                INNER JOIN governments g ON e.government_id = g.id
                GROUP BY g.alt_type_slug
            )
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
