<?php

namespace GovWiki\EnvironmentBundle\Manager\Data\Government;

use Doctrine\ORM\EntityManagerInterface;
use GovWiki\DbBundle\Entity\Environment;
use GovWiki\DbBundle\Entity\Repository\GovernmentRepository;
use GovWiki\EnvironmentBundle\Converter\DataTypeConverter;
use GovWiki\EnvironmentBundle\Manager\Data\AbstractDataManager;
use GovWiki\EnvironmentBundle\Strategy\DefaultNamingStrategy;

/**
 * Class GovernmentManager
 * @package GovWiki\EnvironmentBundle\Data\Manager\Data\Government
 */
class GovernmentManager implements GovernmentManagerInterface
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
    public function createTable(Environment $environment, array $columnDefinitions)
    {
        /*
         * Generate column definition from given columns.
         */
        $columnSqlDefinition = '';
        foreach ($columnDefinitions as $fieldName => $type) {
            $type = DataTypeConverter::abstract2database($type);

            $columnSqlDefinition .= "`{$fieldName}` {$type} DEFAULT NULL";
        }

        $tableName = DefaultNamingStrategy::environmentRelatedTableName(
            $environment
        );

        $this->em->getConnection()->exec("
            CREATE TABLE `{$tableName}` (
                `id` int(11) NOT NULL AUTO_INCREMENT,
                `government_id` int(11) DEFAULT NULL,
                CONSTRAINT `fk_{$tableName}_government`
                    FOREIGN KEY (`government_id`)
                    REFERENCES `governments` (`id`),
                {$columnSqlDefinition}
                PRIMARY KEY (`id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
        ");

        return $this;
    }

    /**
     * {@inheritdoc}
     */
    public function removeTable(Environment $environment)
    {
        $tableName = DefaultNamingStrategy::environmentRelatedTableName(
            $environment
        );
        $this->em->getConnection()
            ->exec("DROP TABLE IF EXISTS `{$tableName}``");
    }

    /**
     * {@inheritdoc}
     */
    public function get(Environment $environment, $government, $year, array $fields)
    {
        if (is_array($fields) && (count($fields) > 0)) {
            $tableName = DefaultNamingStrategy::environmentRelatedTableName(
                $environment
            );

            // Prepare field statement for query.
            $fieldsStmt = implode(',', array_keys($fields));

            // Fetch data.
            $data = $this->em->getConnection()->fetchAssoc("
                SELECT {$fieldsStmt} FROM {$tableName}
                WHERE
                    government_id = {$government} AND
                    year = {$year}
            ");

            // Convert value to proper type.
            $validData = [];
            foreach ($data as $field => $value) {
                /*
                 * Get field type from formats.
                 */
                $type = $fields[$field];

                switch ($type) {
                    case 'integer':
                        $value = (int) $value;
                        break;

                    case 'float':
                        $value = (float) $value;
                        break;
                }

                $validData[$field] = $value;
            }

            return $validData;
        }

        return [];
    }

    /**
     * {@inheritdoc}
     */
    public function getGovernmentRank(
        Environment $environment,
        $altTypeSlug,
        $governmentSlug,
        array $parameters
    ) {
        // Get values from parameters array.
        $rankFieldName = $parameters['field_name'];
        $limit = $parameters['limit'];
        $page = $parameters['page'];
        $order = $parameters['order'];
        $nameOrder = $parameters['name_order'];
        $year = $parameters['year'];

        $fieldName = DefaultNamingStrategy::originalFromRankFieldName(
            $rankFieldName
        );

        $mainSql = "
            SELECT
                government.slug AS name,
                extra.{$fieldName} AS amount,
                extra.{$rankFieldName} AS value
            FROM {$environment} extra
            INNER JOIN governments government ON extra.government_id = government.id
        ";

        $wheres = [
            "government.alt_type_slug = '{$altTypeSlug}'",
            "year = {$year}",
        ];
        $orderBys = [];

        /*
         * Get list of rank started from given government.
         */
        if ((null === $order) || ('' === $order)) {
            /*
             * Get rank for given government.
             */

            $sql = "
                SELECT extra.{$rankFieldName}
                FROM {$environment} extra
                INNER JOIN governments government ON extra.government_id = government.id
                WHERE
                    government.alt_type_slug = '{$altTypeSlug}' AND
                    government.slug = '{$governmentSlug}'
                ORDER BY extra.{$rankFieldName}
                LIMIT 1
            ";

            $wheres[] = "extra.{$rankFieldName} >= (". $sql .')';
            if (('desc' !== $nameOrder) && ('asc' !== $nameOrder)) {
                $orderBys[] = "extra.{$rankFieldName} ASC";
            }
            /*
             * Get sorted information from offset computed on given page and limit.
             */
        } elseif ('desc' === $order) {
            $orderBys[] = "extra.{$rankFieldName} DESC";
        } elseif ('asc' === $order) {
            $orderBys[] = "extra.{$rankFieldName} ASC";
        }

        if ('desc' === $nameOrder) {
            $orderBys[] = 'government.slug DESC';
        } elseif ('asc' === $nameOrder) {
            $orderBys[] = 'government.slug ASC';
        }

        if (count($wheres) > 0) {
            $mainSql .= ' WHERE ' . implode(' AND ', $wheres);
        }

        if (count($orderBys) > 0) {
            $mainSql .= ' ORDER BY ' .implode(' , ', $orderBys);
        }

        $mainSql .= ' LIMIT '. ($page * $limit) .', '. $limit;

        return $this->em->getConnection()->fetchAll($mainSql);
    }

    /**
     * {@inheritdoc}
     */
    public function searchGovernmentForComparison(
        Environment $environment,
        $partOfName
    ) {
        /** @var GovernmentRepository $repository */
        $repository = $this->em->getRepository('GovWikiDbBundle:Government');

        return $repository->searchForComparison(
            $environment->getId(),
            $partOfName
        );
    }

    /**
     * {@inheritdoc}
     */
    public function getComparedGovernments(Environment $environment, array $data)
    {
        $expr = $this->em->getExpressionBuilder();

        $firstGovernmentId = $data['firstGovernment']['id'];
        $secondGovernmentId = $data['secondGovernment']['id'];

        if (array_key_exists('category', $data)) {
            /*
             * Compare by categories: 'Revenue' or 'Expenditure'.
             */
            $qb = $this->em->createQueryBuilder()
                ->select(
                    'partial FinData.{id, caption, dollarAmount, displayOrder}',
                    'Category, Fund'
                )
                ->from('GovWikiDbBundle:FinData', 'FinData')
                ->innerJoin('FinData.captionCategory', 'Category')
                ->innerJoin('FinData.fund', 'Fund')
                ->where($expr->andX(
                    $expr->eq('Category.name', ':name'),
                    $expr->neq('FinData.caption', ':caption')
                ))
                ->orderBy($expr->asc('Category.name'))
                ->setParameters([
                    'name' => $data['category'],
                    'caption' => 'Total '. $data['category'],
                ]);

            $firstQb = clone $qb;

            $firstQb->andWhere($expr->andX(
                $expr->eq('FinData.government', $firstGovernmentId),
                $expr->eq('FinData.year', $data['firstGovernment']['year'])
            ));

            $result = $firstQb->getQuery()->getArrayResult();

            /*
             * Compute total funds.
             */
            $firstGovernmentData = $this->computeFinData($result);

            /*
             * Get data for second government.
             */
            $qb->andWhere($expr->andX(
                $expr->eq('FinData.government', $secondGovernmentId),
                $expr->eq('FinData.year', $data['secondGovernment']['year'])
            ));

            $result = $qb->getQuery()->getArrayResult();

            /*
             * Compute total funds.
             */
            $secondGovernmentData = $this->computeFinData($result);

            $data['firstGovernment']['data'] = $firstGovernmentData;
            $data['secondGovernment']['data'] = $secondGovernmentData;
        } elseif ('Financial Statements' === $data['tab']) {
            /*
             * Compare by financial statements.
             */
            $qb = $this->em->createQueryBuilder()
                ->select(
                    'FinData.caption, FinData.dollarAmount AS amount'
                )
                ->from('GovWikiDbBundle:FinData', 'FinData')
                ->where($expr->eq('FinData.fund', 99)); // Only total funds.

            if (array_key_exists('caption', $data) & !empty($data['caption'])) {
                $qb->andWhere(
                    $expr->eq('FinData.caption', $expr->literal($data['fieldName']))
                );
            }

            /*
             * Get data for first government.
             */
            $firstQb = clone $qb;
            $firstQb->andWhere($expr->andX(
                $expr->eq('FinData.government', $firstGovernmentId),
                $expr->eq('FinData.year', $data['firstGovernment']['year'])
            ));

            $firstGovernmentData = $firstQb->getQuery()->getArrayResult();

            /*
             * Get data for second government.
             */
            $qb->andWhere($expr->andX(
                $expr->eq('FinData.government', $secondGovernmentId),
                $expr->eq('FinData.year', $data['secondGovernment']['year'])
            ));

            $secondGovernmentData = $qb->getQuery()->getArrayResult();

            $data['firstGovernment']['data'] = $firstGovernmentData;
            $data['secondGovernment']['data'] = $secondGovernmentData;
        } else {
            /*
             * Compare by over tabs.
             */
            $con = $this->em->getConnection();

            $firstGovernmentData = $con->fetchAll("
                SELECT
                    '{$data['caption']}' AS caption,
                    {$data['fieldName']} AS amount,
                    '{$data['fieldName']}' AS fieldName
                FROM {$environment->getId()}
                WHERE government_id = {$firstGovernmentId}
            ");

            $secondGovernmentData = $con->fetchAll("
                SELECT
                    '{$data['caption']}' AS caption,
                    {$data['fieldName']} AS amount,
                    '{$data['fieldName']}' AS fieldName
                FROM {$environment->getId()}
                WHERE government_id = {$secondGovernmentId}
            ");

            $data['firstGovernment']['data'] = $firstGovernmentData;
            $data['secondGovernment']['data'] = $secondGovernmentData;
        }

        return $data;
    }

    /**
     * @param array $result Raw fin data result.
     *
     * @return array
     */
    private function computeFinData(array $result)
    {
        $data = [];

        $financialStatementsGroups = [];
        foreach ($result as $finDataItem) {
            $financialStatementsGroups[$finDataItem['caption']][] = $finDataItem;
        }
        $i = 0;
        foreach ($financialStatementsGroups as $caption => $finData) {
            $data[$i]['amount'] = 0.0;

            foreach ($finData as $finDataItem) {
                $data[$i]['caption'] = $caption;
                $data[$i]['category'] = $finDataItem['captionCategory']['name'];

                if ('Total' === $finDataItem['fund']['name']) {
                    $data[$i]['amount'] = $finDataItem['dollarAmount'];
                }
            }
            $i++;
        }

        return $data;
    }
}
