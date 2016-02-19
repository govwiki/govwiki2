<?php

namespace GovWiki\DbBundle\Service;

use Doctrine\ORM\EntityManagerInterface;
use GovWiki\DbBundle\Entity\MaxRank;
use GovWiki\DbBundle\Entity\Repository\FormatRepository;
use GovWiki\DbBundle\Entity\Repository\GovernmentRepository;

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
        /** @var GovernmentRepository $repository */
        $governmentRepository = $this->em
            ->getRepository('GovWikiDbBundle:Government');

        /** @var FormatRepository $repository */
        $formatRepository = $this->em->getRepository('GovWikiDbBundle:Format');
        $rankedFieldList = $formatRepository->getRankedFields($environment);

        /*
         * Get all available alt types for given environment.
         */
        $altTypeList = $governmentRepository
            ->getAvailableAltTypes($environment);

        /*
         * Compute max values.
         */
        $this->createTable($environment, $rankedFieldList);
        foreach ($altTypeList as $altType) {
            $maxRankList = $this
                ->computeMaxRanks($environment, $altType, $rankedFieldList);

            $
        }

    }

    /**
     * {@inheritdoc}
     */
    public static function getTableName($environment)
    {
        return "{$environment}_max_ranks";
    }

    /**
     * Create new max ranks table for given environment.
     *
     * @param string $environment     Environment slug.
     * @param array  $rankedFieldList Array of field which have rank.
     *
     * @return void
     *
     * @throws \Doctrine\DBAL\DBALException Error while create table.
     */
    private function createTable($environment, array $rankedFieldList)
    {
        /*
         * Prepare sql parts for column definitions.
         */
        $makeSqlPart = function ($element) {
            return "{$element} INT(11) DEFAULT NULL";
        };
        $rankedFieldList = array_map($makeSqlPart, $rankedFieldList);
        $sql = implode(',', $rankedFieldList);

        $con = $this->em->getConnection();
        $tableName = self::getTableName($environment);

        /*
         * Remove old max ranks table and create new.
         */
        $con->exec("DROP TABLE IF EXISTS {$tableName}");
        $con->exec("
            CREATE TABLE `{$tableName}`` (
                `id` INT(11) AUTO_INCREMENT,
                `alt_type_slug` VARCHAR(255) NOT NULL,
                `environment` VARCHAR(255) NOT NULL,
                {$sql},
                PRIMARY KEY (`id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
        ");
    }

    private function insert($environment, $maxRankList)

    /**
     * Compute new max values for in given environment for alt type.
     *
     * @param string $environment     Environment slug.
     * @param string $altType         Slugged alt type name.
     * @param array  $rankedFieldList Array of field which have rank.
     *
     * @return array
     *
     * @throws \Doctrine\DBAL\DBALException Error while create table.
     */
    private function computeMaxRanks($environment, $altType, array $rankedFieldList)
    {
        $makeSqlPart = function ($element) {
            return "MAX(e.{$element})";
        };
        $con = $this->em->getConnection();
        $rankedFieldList = array_map($makeSqlPart, $rankedFieldList);
        $sql = implode(',', $rankedFieldList);

        return $con->fetchAll("
            SELECT {$sql}
            FROM {$environment} e
            JOIN governments g ON e.government_id = g.id
            WHERE g.alt_type_slug = '{$altType}'
        ");
    }


//    /**
//     * Compute and persist to database new max ranks values.
//     *
//     * @return MaxRankComputer
//     */
//    public function compute()
//    {
//        /*
//         * Get all available alt types for given environment.
//         */
//
//
//
//        /** @var GovernmentRepository $repository */
//        $repository = $this->em->getRepository('GovWikiDbBundle:Government');
//
//        foreach ($altTypes as $type) {
//            $data = $repository->computeMaxRanks($type);
//
//            $maxRank = new MaxRank();
//            $maxRank->setAltType($type);
//
//            foreach ($data as $field => $value) {
//                call_user_func([$maxRank, 'set' . ucfirst($field)], $value);
//            }
//            $this->em->persist($maxRank);
//        }
//
//        $this->em
//            ->createQueryBuilder()
//            ->delete()
//            ->from('GovWikiDbBundle:MaxRank', 'MaxRank')
//            ->getQuery()
//            ->execute();
//        $this->em->flush();
//
//        return $this;
//    }
}
