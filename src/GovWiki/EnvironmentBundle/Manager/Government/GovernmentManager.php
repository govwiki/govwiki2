<?php

namespace GovWiki\EnvironmentBundle\Manager\Government;

use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Query;
use GovWiki\DbBundle\Entity\Environment;
use GovWiki\DbBundle\Entity\Format;
use GovWiki\DbBundle\Entity\Government;
use GovWiki\DbBundle\Entity\Repository\GovernmentRepository;
use GovWiki\EnvironmentBundle\Converter\DataTypeConverter;
use GovWiki\EnvironmentBundle\Manager\Format\FormatManagerInterface;
use GovWiki\EnvironmentBundle\Manager\MaxRank\MaxRankManagerInterface;
use GovWiki\EnvironmentBundle\Strategy\GovwikiNamingStrategy;

/**
 * Class GovernmentManager
 * @package GovWiki\EnvironmentBundle\Data\Manager\Government
 */
class GovernmentManager implements GovernmentManagerInterface
{

    /**
     * @var EntityManagerInterface
     */
    private $em;

    /**
     * @var MaxRankManagerInterface
     */
    private $maxRankManager;

    /**
     * @var FormatManagerInterface
     */
    private $formatManager;

    /**
     * @param EntityManagerInterface  $em             A EntityManagerInterface
     *                                                instance.
     * @param MaxRankManagerInterface $maxRankManager A MaxRankManagerInterface
     *                                                instance.
     * @param FormatManagerInterface  $formatManager  A FormatManagerInterface
     *                                                instance.
     */
    public function __construct(
        EntityManagerInterface $em,
        MaxRankManagerInterface $maxRankManager,
        FormatManagerInterface $formatManager
    ) {
        $this->em = $em;
        $this->maxRankManager = $maxRankManager;
        $this->formatManager = $formatManager;
    }

    /**
     * {@inheritdoc}
     */
    public function getAvailableYears(
        Environment $environment,
        Government $government = null
    ) {
        $con = $this->em->getConnection();
        $tableName = GovwikiNamingStrategy::environmentRelatedTableName(
            $environment
        );

        if ($government === null) {
            // Get available years for all government's in specified environment.
            $years = $con->fetchAll("
                SELECT year
                FROM {$tableName}
                GROUP BY year
                ORDER BY year DESC
            ");
        } else {
            // Get available years for specified government.
            $years = $con->fetchAll("
                SELECT year
                FROM `{$tableName}`
                WHERE government_id = {$government->getId()}
                GROUP BY year
            ");
        }

        return array_map(
            function (array $result) {
                return $result['year'];
            },
            $years
        );
    }

    /**
     * {@inheritdoc}
     */
    public function createTable(Environment $environment, array $columnDefinitions = [])
    {
        /*
         * Generate column definition from given columns.
         */
        $columnSqlDefinition = '';
        foreach ($columnDefinitions as $fieldName => $type) {
            $type = DataTypeConverter::abstract2database($type);

            $columnSqlDefinition .= "`{$fieldName}` {$type} DEFAULT NULL";
        }

        $tableName = GovwikiNamingStrategy::environmentRelatedTableName(
            $environment
        );

        $this->em->getConnection()->exec("
            CREATE TABLE `{$tableName}` (
                `id` int(11) NOT NULL AUTO_INCREMENT,
                `government_id` int(11) DEFAULT NULL,
                `year` int(4) DEFAULT NULL,
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
        $tableName = GovwikiNamingStrategy::environmentRelatedTableName(
            $environment
        );
        $this->em->getConnection()
            ->exec("DROP TABLE IF EXISTS `{$tableName}``");
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

        $tableName = GovwikiNamingStrategy::environmentRelatedTableName(
            $environment
        );
        $fieldName = GovwikiNamingStrategy::originalFromRankFieldName(
            $rankFieldName
        );

        $mainSql = "
            SELECT
                government.slug AS name,
                extra.{$fieldName} AS amount,
                extra.{$rankFieldName} AS value
            FROM {$tableName} extra
            JOIN governments government ON extra.government_id = government.id
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
                FROM {$tableName} extra
                JOIN governments government ON extra.government_id = government.id
                WHERE
                    government.alt_type_slug = '{$altTypeSlug}' AND
                    government.slug = '{$governmentSlug}' AND
                    year = {$year}
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
    public function searchGovernment(Environment $environment, $partOfName)
    {
        /** @var GovernmentRepository $repository */
        $repository = $this->em->getRepository('GovWikiDbBundle:Government');

        return $repository->search($environment->getId(), $partOfName);
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
    public function getCategoriesForComparisonByGovernment(
        Environment $environment,
        array $governments
    ) {
        $con = $this->em->getConnection();

        /*
         * Collect governments alt types.
         */
        $altTypes = [];
        foreach ($governments as $government) {
            $altTypes[$government['altType']] = true;
        }
        $altTypes = array_keys($altTypes);


        /*
         * Get financial statements captions.
         */
        $financialStatementCaptionList = $con->fetchAll("
            SELECT
                f.caption AS name,
                f.name AS category,
                'Financial Statements' AS tab,
                '$0.0' AS mask,
                NULL AS fieldName
            FROM (
                    SELECT f2.caption, cc.name
                    FROM findata f2
                    INNER JOIN caption_categories cc
                        ON cc.id = f2.caption_category_id
                    WHERE
                      f2.government_id = {$governments[0]['id']} AND
                      f2.caption_category_id in (2, 3) AND
                      f2.year = {$governments[0]['year']}
                    GROUP BY caption
                ) f
            INNER JOIN (
                SELECT caption
                FROM findata
                WHERE
                  government_id = {$governments[1]['id']} AND
                  caption_category_id in (2, 3) AND
                      year = {$governments[1]['year']}
                GROUP BY caption
            ) s ON f.caption = s.caption
        ");

        /*
         * Select available for comparison field from tabs.
         * For example 'Financial Highlight' and etc.
         */
        /*
         * Get array of fields and array of ranked fields.
         */
        $fields = [];

        $tmp = $this->formatManager->get($environment, true);
        foreach ($tmp as $format) {
            $intersects = array_intersect($altTypes, $format['showIn']);
            $isShowInAllAltTypes = count($intersects) === count($altTypes);

            if ($isShowInAllAltTypes && ('string' !== $format['type'])) {
                /*
                 * This format available for all given alt types and given field
                 * type is not string.
                 */
                $fields[] = [
                    'name' => $format['name'],
                    'fieldName' => $format['field'],
                    'category' => null,
                    'tab' => $format['tab_name'],
                    'tab_id' => $format['tab_id'],
                    'category_id' => $format['category_id'],
                    'mask' => $format['mask'],
                ];
            }
        }

        return array_merge($financialStatementCaptionList, $fields);
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
     * {@inheritdoc}
     */
    public function getGovernment(
        Environment $environment,
        $altTypeSlug,
        $slug,
        $year = null
    ) {

        $altType = str_replace('_', ' ', $altTypeSlug);
        $fields = $this->formatManager->getList($environment, $altType);

        /*
         *  Fetch government.
         */
        $data = $this->em->getRepository('GovWikiDbBundle:Government')
            ->findGovernment(
                $environment->getId(),
                $altTypeSlug,
                $slug,
                $year
            );

        $government = $data['government'];
        $lastEditRequest = $data['lastEdit'];

        /*
         * Fetch environment related government data if at least one field
         * showing for given alt type.
         */
        $dataFields = [];
        foreach ($fields as $field) {
            if ($field['source'] === Format::SOURCE_GOVERNMENT) {
                continue;
            }

            $dataFields[$field['field']] = $field['type'];
            if ($field['ranked'] === true) {
                $name = GovwikiNamingStrategy::rankedFieldName($field['field']);
                $dataFields[$name] = 'integer';
            }
        }

        $data = $this->get($environment, $government['id'], $year, $dataFields);
        $government = array_merge($government, $data);
        unset($data, $dataFields);

        $ranked = array_filter(
            $fields,
            function (array $field) {
                return $field['ranked'] === true;
            }
        );

        if (count($ranked) > 0) {
            /*
             * Get max ranks.
             */
            $data = $this->maxRankManager->get(
                $environment,
                $altTypeSlug,
                $year
            );
            if ($data === false) {
                $this->maxRankManager->computeAndSave(
                    $environment,
                    $fields,
                    $year
                );
                $data = $this->maxRankManager->get(
                    $environment,
                    $altTypeSlug,
                    $year
                );
            }
            $government['ranks'] = [];

            if (count($data) > 0) {
                unset($data['alt_type_slug'], $data['year']);
                foreach ($data as $field => $maxValue) {
                    if (array_key_exists($field, $government)) {
                        $rankName = GovwikiNamingStrategy::rankedFieldName($field);
                        $fieldProperty = $fields[$field];
                        $type = $fieldProperty['rankType'];
                        $value = $government[$rankName];

                        $result = [
                            'type' => $type,
                        ];

                        if ($type === Format::RANK_LETTER) {
                            // Use letter for rank type.
                            $currentRanges = $fieldProperty['rankLetterRanges'][$altTypeSlug];

                            $percent = (100 * $value) / $maxValue;
                            foreach ($currentRanges as $letter => $range) {
                                if (($range['start'] >= $percent) && ($range['end'] <= $percent)) {
                                    $result['letter'] = $letter;
                                    break;
                                }
                            }

                        } else {
                            $result['current'] = $value;
                            $result['max'] = $maxValue;
                        }

                        $government['ranks'][$rankName] = $result;
                    }
                }

            }
        }

        // Get all available tabs.
        $tabs = $this->em->getRepository('GovWikiDbBundle:Tab')
            ->getForGovernment($environment->getId(), $altType);

        $government['currentYear'] = $year;

        $government['commentChanges'] = [
            'changed' => $lastEditRequest !== null,
            'changedBy' => $lastEditRequest['user']['id'],
            'lastChanges' => $lastEditRequest['changes']['comment'],
        ];

        return [
            'government' => $government,
            'tabs' => $tabs,
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function getEnvironmentRelatedData(
        Environment $environment,
        $government,
        $year,
        array $fields = null
    ) {
        $tableName = GovwikiNamingStrategy::environmentRelatedTableName(
            $environment
        );

        $fieldsStmt = '*';
        if ($fields !== null) {
            $fieldsStmt = implode(',', $fields);
        }

        return $this->em->getConnection()->fetchAssoc("
            SELECT {$fieldsStmt} FROM {$tableName}
            WHERE
                government_id = {$government} AND
                year = {$year}
        ");
    }

    /**
     * {@inheritdoc}
     */
    public function getConditionValuesForGovernment(
        Environment $environment,
        $government,
        $fieldName
    ) {
        $tabName = GovwikiNamingStrategy::environmentRelatedTableName($environment);

        return $this->em->getConnection()->fetchAll("
            SELECT
                year,
                {$fieldName} AS data
            FROM {$tabName}
            WHERE government_id = {$government}
        ");
    }

    /**
     * {@inheritdoc}
     */
    public function getConditionValues(Environment $environment, $fieldName) {
        $tabName = GovwikiNamingStrategy::environmentRelatedTableName($environment);

        // Get values for specified field as json string.
        return $this->em->getConnection()->fetchAll("
            SELECT g.slug, g.alt_type_slug, g.name,
            CONCAT ('{', GROUP_CONCAT( CONCAT ('\"', eg.year, '\":', eg.{$fieldName}) ), '}') AS data
            FROM `{$tabName}` eg
            JOIN governments g ON g.id = eg.government_id
            GROUP BY g.alt_type_slug, g.slug
            ORDER BY g.alt_type_slug, g.slug;
        ");
    }

    /**
     * {@inheritdoc}
     */
    public function removeData(Environment $environment, $government, $year = null)
    {
        $tableName = GovwikiNamingStrategy::environmentRelatedTableName($environment);

        $sql = "
            DELETE FROM {$tableName}
            WHERE government_id = {$government}
        ";

        if ($year) {
            // Delete data only for specified year.
            $sql .= " AND year = {$year}";
        }

        $this->em->getConnection()->exec($sql);
    }

    /**
     * {@inheritdoc}
     */
    public function persistGovernmentData(
        Environment $environment,
        Government $government,
        array $data
    ) {
        $tableName = GovwikiNamingStrategy::environmentRelatedTableName(
            $environment
        );

        if (array_key_exists('id', $data)) {
            unset($data['id']);
        }

        // Add government to fields.
        $data['government_id'] = $government->getId();

        $fields = implode(',', array_keys($data));
        $values = array_map(
            function ($value) {
                $value = (! is_numeric($value)) ? "'{$value}'" : $value;
                $value = ($value === null) ? 'NULL' : $value;

                return $value;
            },
            array_values($data)
        );
        $values = implode(',', $values);

        $this->em->getConnection()->exec("
            INSERT INTO `{$tableName}` ({$fields})
            VALUES ({$values})
        ");
    }

    /**
     * {@inheritdoc}
     */
    public function updateGovernmentData(
        Environment $environment,
        Government $government,
        $year,
        array $data
    ) {
        $tableName = GovwikiNamingStrategy::environmentRelatedTableName(
            $environment
        );

        $stmt = '';
        if (array_key_exists('id', $data)) {
            unset($data['id']);
        }

        foreach ($data as $field => $value) {
            if (is_string($value)) {
                $value = "'{$value}'";
            } elseif (null === $value) {
                $value = 'NULL';
            }

            $stmt .= "{$field} = {$value},";
        }
        $stmt = rtrim($stmt, ',');

        $this->em->getConnection()->exec("
            UPDATE `{$tableName}` SET {$stmt}
            WHERE
                government_id = {$government->getId()} AND
                year = {$year}
        ");
    }

    /**
     * {@inheritdoc}
     */
    public function addColumn(Environment $environment, $name, $type)
    {
        $tableName = GovwikiNamingStrategy::environmentRelatedTableName(
            $environment
        );
        $type = DataTypeConverter::abstract2database($type);

        $this->em->getConnection()->exec("
            ALTER TABLE `{$tableName}` ADD `{$name}` {$type} DEFAULT NULL
        ");
    }

    /**
     * {@inheritdoc}
     */
    public function changeColumn(
        Environment $environment,
        $oldName,
        $newName,
        $newType
    )
    {
        $tableName = GovwikiNamingStrategy::environmentRelatedTableName(
            $environment
        );
        $newType = DataTypeConverter::abstract2database($newType);

        $this->em->getConnection()->exec("
            ALTER TABLE `{$tableName}`
            CHANGE `{$oldName}` `{$newName}` {$newType} DEFAULT NULL
        ");
    }

    /**
     * @param Environment $environment A Environment entity instance.
     * @param string      $name        Column name.
     *
     * @return void
     */
    public function deleteColumn(Environment $environment, $name)
    {
        $tableName = GovwikiNamingStrategy::environmentRelatedTableName(
            $environment
        );

        $this->em->getConnection()->exec("
            ALTER TABLE `{$tableName}` DROP `{$name}`
        ");
    }

    /**
     * @param Environment $environment A Environment entity instance.
     * @param boolean     $slugged     Return altTypeSlug's instead of altType's
     *                                 if true.
     *
     * @return string[]
     */
    public function getUsedAltTypes(Environment $environment, $slugged = false)
    {
        $expr = $this->em->getExpressionBuilder();

        $fieldName = 'altType';
        if ($slugged) {
            $fieldName = 'altTypeSlug';
        }

        $result = $this->em->createQueryBuilder()
            ->select('Government.'. $fieldName)
            ->from('GovWikiDbBundle:Government', 'Government')
            ->where($expr->eq('Government.environment', ':environment'))
            ->setParameter('environment', $environment->getId())
            ->groupBy('Government.'. $fieldName)
            ->orderBy('Government.'. $fieldName)
            ->getQuery()
            ->getArrayResult();


        $result = array_map(
            function (array $row) use ($fieldName) {
                return $row[$fieldName];
            },
            $result
        );
        $result = array_filter($result);

        $altTypes = [];
        foreach ($result as $altType) {
            $altTypes[$altType] = $altType;
        }

        return $altTypes;
    }

    /**
     * @param Environment  $environment A Environment entity instance.
     * @param Format|array $format      A Format entity instance.
     *
     * @return void
     *
     * @throws \Doctrine\DBAL\DBALException Error while update.
     */
    public function calculateRanks(Environment $environment, $format)
    {
        if (is_array($format)) {
            $fieldName = $format['field'];
            $showIn = $format['showIn'];
        } elseif ($format instanceof Format) {
            $fieldName = $format->getField();
            $showIn = $format->getShowIn();
        } else {
            $error = 'Invalid $format argument. Expect array or instance of Format';
            throw new \InvalidArgumentException($error);
        }

        $tableName = GovwikiNamingStrategy::environmentRelatedTableName($environment);
        $rankName = GovwikiNamingStrategy::rankedFieldName($fieldName);

        $altTypeSlugs = array_map(function ($slug) {
            return "'{$slug}'";
        }, $showIn);
        $slugs = implode(',', $altTypeSlugs);

        $this->em->getConnection()->exec("
            UPDATE {$tableName}
            JOIN (
                SELECT
                    governments.id,
                    @rank := IF(@prev_value=data.{$fieldName},@rank,@rank + 1) AS rank,
                    @prev_value := data.{$fieldName}
                FROM {$tableName} data
                JOIN (SELECT @rank := 0) x
                JOIN (SELECT @prev_value := -1) y
                JOIN governments ON governments.id = data.government_id
                WHERE governments.alt_type_slug in ({$slugs})
                ORDER BY data.{$fieldName} DESC
            ) x ON government_id = x.id
            SET
                {$rankName} = x.rank
            WHERE
                government_id = x.id;
        ");
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

    /**
     * Get environment related data for government.
     *
     * @param Environment $environment A Environment entity instance.
     * @param integer     $government  Government entity id.
     * @param integer     $year        Year of fetching data.
     * @param array       $fields      Array of fetching fields.
     *
     * @return mixed
     */
    private function get(Environment $environment, $government, $year, array $fields)
    {
        if (is_array($fields) && (count($fields) > 0)) {
            // Fetch data.
            $data = $this->getEnvironmentRelatedData(
                $environment,
                $government,
                $year,
                array_keys($fields)
            );

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
}
