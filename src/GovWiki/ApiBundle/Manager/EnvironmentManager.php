<?php

namespace GovWiki\ApiBundle\Manager;

use CartoDbBundle\Service\CartoDbApi;
use Doctrine\DBAL\DBALException;
use Doctrine\ORM\Query\QueryException;
use Doctrine\ORM\EntityManagerInterface;
use GovWiki\DbBundle\Entity\EditRequest;
use GovWiki\DbBundle\Entity\ElectedOfficial;
use GovWiki\DbBundle\Entity\Environment;
use GovWiki\DbBundle\Entity\Government;
use GovWiki\DbBundle\Entity\Map;
use GovWiki\DbBundle\Entity\Repository\GovernmentRepository;
use GovWiki\DbBundle\Entity\Repository\ElectedOfficialRepository;
use GovWiki\DbBundle\Service\MaxRankComputer;
use GovWiki\DbBundle\Service\MaxRankComputerInterface;
use GovWiki\DbBundle\Utils\Functions;

/**
 * Class EnvironmentManager
 * @package GovWiki\ApiBundle\Manager
 */
class EnvironmentManager implements EnvironmentManagerAwareInterface
{
    /**
     * @var EntityManagerInterface
     */
    private $em;

    /**
     * @var CartoDbApi
     */
    private $api;

    /**
     * @var string
     */
    private $environment;

    /**
     * @var MaxRankComputerInterface
     */
    private $computer;

    /**
     * @var Environment
     */
    private $entity;

    /**
     * @param EntityManagerInterface   $em       A EntityManagerInterface
     *                                           instance.
     * @param CartoDbApi               $api      A CartoDbApi instance.
     * @param MaxRankComputerInterface $computer A MaxRankComputerInterface
     *                                           instance.
     */
    public function __construct(
        EntityManagerInterface $em,
        CartoDbApi $api,
        MaxRankComputerInterface $computer
    ) {
        $this->em = $em;
        $this->api = $api;
        $this->computer = $computer;
    }

    /**
     * {@inheritdoc}
     */
    public function setEnvironment($environment)
    {
        if (('' === $environment) | ('admin' === $environment)) {
            return $this;
        }

        $this->environment = $environment;

        return $this;
    }

    /**
     * @return string
     */
    public function getEnvironment()
    {
        return $this->environment;
    }

    /**
     * @return Environment
     */
    public function getEntity()
    {
        if (null === $this->entity) {
            $this->entity = $this->em->getRepository('GovWikiDbBundle:Environment')
                ->getByName($this->environment);
        }

        return $this->entity;
    }

    /**
     * @return string
     */
    public function getSlug()
    {
        return Environment::slugify($this->environment);
    }

    /**
     * @return array|null
     */
    public function getMap()
    {
        $map = $this->getEntity()->getMap();

        return [
            'centerLatitude' => $map->getCenterLatitude(),
            'centerLongitude' => $map->getCenterLongitude(),
            'zoom' => $map->getZoom(),
            'position' => $map->getPosition(),
            'colorizedCountyConditions' => $map->getColorizedCountyConditions(),
            'debug' => $map->isDebug(),
            'legendTypes' => $map->getLegendTypes(),
            'legend' => $map->getLegend(),
        ];
    }

    public function getAvailableYears()
    {
        $con = $this->em->getConnection();

        $years = $con->fetchAll("
            SELECT year
            FROM {$this->environment}
            GROUP BY year
            ORDER BY year DESC
        ");

        return array_map(
            function (array $result) { return $result['year']; },
            $years
        );
    }

    /**
     * @return string
     */
    public function getTitle()
    {
        return $this->getEntity()->getTitle();
    }

    /**
     * @return array
     */
    public function getRankedFields()
    {
        return $this->em->getRepository('GovWikiDbBundle:Format')
            ->getRankedFields($this->environment);
    }

    /**
     * Get format information for given field.
     *
     * @param string $fieldName Field name.
     *
     * @return array|null
     */
    public function getFieldFormat($fieldName)
    {
        return $this->em->getRepository('GovWikiDbBundle:Format')
            ->getOne($this->entity->getId(), $fieldName);
    }

    /**
     * @param string $altTypeSlug Slugged government alt type.
     * @param string $slug        Slugged government name.
     *
     * @return Government
     */
    public function getGovernmentWithoutData($altTypeSlug, $slug)
    {
        return $this->em->getRepository('GovWikiDbBundle:Government')
            ->getOne($this->getSlug(), $altTypeSlug, $slug);
    }

    /**
     * @param string  $altTypeSlug Slugged government alt type.
     * @param string  $slug        Slugged government name.
     * @param integer $year        For fetching fin data.
     *
     * @return array
     */
    public function getGovernment($altTypeSlug, $slug, $year = null)
    {
        $tmp = $this->em->getRepository('GovWikiDbBundle:Format')
            ->get($this->environment, true);

        /*
         * Get array of fields and array of ranked fields.
         */
        $fields = [];
        $altType = str_replace('_', ' ', $altTypeSlug);
        $formats = [];
        foreach ($tmp as $format) {
            if (in_array($altType, $format['showIn'], true)) {
                $fields[] = $format['field'];

                if ('data' === $format['dataOrFormula']) {
                    $formats[] = $format;
                    if (true === $format['ranked']) {
                        $rankedFieldName = $format['field'] . '_rank';
                        $fields[] = $rankedFieldName;
                    }
                }

            }
        }

        $government = $this->em->getRepository('GovWikiDbBundle:Government')
            ->findGovernment($this->environment, $altTypeSlug, $slug, $year);
        if (null === $government) {
            return [];
        }

        /*
         * Fetch environment related government data if at least one field
         * showing for given alt type.
         */
        if (is_array($fields) && (count($fields) > 0)) {
            $fields = implode(',', $fields);
            $data = $this->em->getConnection()->fetchAssoc("
                SELECT {$fields} FROM {$this->environment}
                WHERE
                    government_id = {$government['id']} AND
                    year = {$year}
            ");

            /*
             * Set properly type for values.
             */
            $validData = [];
            $fieldFormats = Functions::groupBy($tmp, [ 'field' ]);
            foreach ($data as $field => $value) {
                if (strpos($field, '_rank') === false) {
                    /*
                     * Get field type from formats.
                     */
                    $type = $fieldFormats[$field]['type'];

                    switch ($type) {
                        case 'integer':
                            $value = (int) $value;
                            break;

                        case 'float':
                            $value = (float) $value;
                            break;
                    }
                } else {
                    $value = (int) $value;
                }

                $validData[$field] = $value;
            }

            $government = array_merge($government, $validData);
            unset($data);
        }

        /*
         * Get max ranks.
         */
        $government['ranks'] = [];

        $con = $this->em->getConnection();
        $tableName = MaxRankComputer::getTableName($this->environment);

        try {
            $data = $con->fetchAssoc("
                SELECT *
                FROM {$tableName}
                WHERE
                    alt_type_slug = '{$altTypeSlug}' AND
                    year = {$year}
            ");
            if (false === $data) {
                $this->computer->compute($this->environment, $altTypeSlug, $year);
                $data = $con->fetchAssoc("
                    SELECT *
                    FROM {$tableName}
                    WHERE
                        alt_type_slug = '{$altTypeSlug}' AND
                        year = '{$year}'
                ");
            }
        } catch (DBALException $e) {
            $this->computer->compute($this->environment, $altTypeSlug, $year);
            $data = $con->fetchAssoc("
                SELECT *
                FROM {$tableName}
                WHERE
                    alt_type_slug = '{$altTypeSlug}' AND
                    year = '{$year}'
            ");
        }

        /*
        $distinctGovermentsCity = $this->em->createQueryBuilder()
            ->select('Government.id, Government.city, Government.slug')
            ->from('GovWikiDbBundle:Government', 'Government')
            ->where('Government.environment = :id')
            ->setParameters(
                [
                    'id' => $data['environment_id'],
                ]
            )
            ->groupBy('Government.slug')
            ->getQuery()
            ->getResult();

        var_dump($distinctGovermentsCity);
        die;
        */

        if (count($data) > 0) {
            unset($data['alt_type_slug'], $data['year']);
            foreach ($data as $field => $value) {
                if (array_key_exists($field, $government)) {
                    $government['ranks'][$field .'_rank'] = [
                        $government[$field .'_rank'],
                        $value
                    ];
                }
            }

        }

        $formats = Functions::groupBy(
            $formats,
            [ 'tab_name', 'category_name', 'field' ]
        );

        $government['currentYear'] = $year;

        return [
            'government' => $government,
            'formats' => $formats,
            'tabs' => array_keys($formats),
        ];
    }

    /**
     * @param string $partOfName Part of government name.
     *
     * @return array
     */
    public function searchGovernment($partOfName)
    {
        /** @var GovernmentRepository $repository */
        $repository = $this->em->getRepository('GovWikiDbBundle:Government');
        return $repository->search($this->environment, $partOfName);
    }

    /**
     * @param string $partOfName Part of government name.
     *
     * @return array
     */
    public function searchGovernmentForComparison($partOfName)
    {
        /** @var GovernmentRepository $repository */
        $repository = $this->em->getRepository('GovWikiDbBundle:Government');
        return $repository->searchForComparison($this->environment, $partOfName);
    }

    /**
     * @param string $partOfName Part of elected official name.
     *
     * @return array
     */
    public function searchElectedOfficial($partOfName)
    {
        /** @var ElectedOfficialRepository $repository */
        $repository = $this->em->getRepository('GovWikiDbBundle:ElectedOfficial');
        $result = $repository->search($this->environment, $partOfName);
        return $result;
    }

    /**
     * @param string $altTypeSlug Slugged government alt type.
     * @param string $slug        Slugged government name.
     * @param array  $parameters  Array of parameters:
     *                            <ul>
     *                              <li>field_name (required)</li>
     *                              <li>limit (required)</li>
     *                              <li>page</li>
     *                              <li>order</li>
     *                              <li>name_order</li>
     *                            </ul>.
     * @return array
     */
    public function getGovernmentRank($altTypeSlug, $slug, array $parameters)
    {
        return $this->em->getRepository('GovWikiDbBundle:Government')
            ->getGovernmentRank(
                $this->environment,
                $altTypeSlug,
                $slug,
                $parameters
            );
    }

    /**
     * @return array|null
     */
    public function getStyle()
    {
        return $this->getEntity()->getStyle();
    }

    /**
     * @param string $altTypeSlug Slugged government alt type.
     * @param string $slug        Slugged government name.
     * @param string $eoSlug      Slugged elected official full name.
     *
     * @return array|null
     */
    public function getElectedOfficial($altTypeSlug, $slug, $eoSlug, $user = null)
    {
        $electedOfficial = $this->em->getRepository('GovWikiDbBundle:ElectedOfficial')
            ->findOne($this->environment, $altTypeSlug, $slug, $eoSlug);

        if (null !== $electedOfficial) {

            /*
            * Create queries for legislations, contributions and etc.
            */
            $votes = $this->em->getRepository('GovWikiDbBundle:ElectedOfficialVote')
                ->getListQuery($electedOfficial['id'], $user);
            $contributions = $this->em->getRepository('GovWikiDbBundle:Contribution')
                ->getListQuery($electedOfficial['id'], $user);
            $endorsements = $this->em->getRepository('GovWikiDbBundle:Endorsement')
                ->getListQuery($electedOfficial['id'], $user);
            $publicStatements = $this->em->getRepository('GovWikiDbBundle:PublicStatement')
                ->getListQuery($electedOfficial['id'], $user);

            return [
                'electedOfficial' => $electedOfficial,
                'votes' => $votes,
                'contributions' => $contributions,
                'endorsements' => $endorsements,
                'publicStatements' => $publicStatements,
                'categories' => $this->em
                    ->getRepository('GovWikiDbBundle:IssueCategory')
                    ->findAll(),
                'electedOfficials' => $this->em
                    ->getRepository('GovWikiDbBundle:Government')
                    ->governmentElectedOfficial($electedOfficial['id']),
            ];
        }

        return null;
    }

    public function countElectedOfficials()
    {
        $qb = $this->em->createQueryBuilder()
            ->from('GovWikiDbBundle:ElectedOfficial', 'eo');
        $expr = $qb->expr();

        return $qb
            ->select($expr->count('eo.id'))
            ->join('eo.government', 'Government')
            ->join('Government.environment', 'Environment')
            ->where($expr->eq(
                'Environment.slug',
                $expr->literal($this->environment
            )))
            ->getQuery()
            ->getSingleScalarResult();
    }

    /**
     * Create new edit request and sets it environment.
     *
     * @return EditRequest
     */
    public function createEditRequest()
    {
        $editRequest = new EditRequest();
        return $editRequest->setEnvironment(
            $this->em->getRepository('GovWikiDbBundle:Environment')
                ->getReferenceByName($this->environment)
        );
    }

    /**
     * Get years by government
     *
     * @param int $id
     * @return array
     */
    public function getYearsByGovernment($id)
    {
        $governments = $this->em->createQueryBuilder()
            ->select('FinData.id, FinData.year')
            ->from('GovWikiDbBundle:FinData', 'FinData')
            ->where('FinData.government = :id')
            ->andWhere('FinData.captionCategory IN (:capId)')
            ->setParameters(
                [
                    'id'    => $id,
                    'capId' => [2, 3],
                ]
            )
            ->groupBy('FinData.year')
            ->getQuery()
            ->getResult();

        return $governments;
    }

    /**
     * Get revenues and expenditures by government.
     *
     * @param array $governments Array of object, each contains id and year.
     *
     * @return array
     */
    public function getCategoriesForComparisonByGovernment(
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

        $tmp = $this->em->getRepository('GovWikiDbBundle:Format')
            ->get($this->environment, true);
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
     * Add to each governments 'data' field with specified findata caption
     * dollar amount and total for fund category.
     *
     * @param array $data Request in form described in
     *                    {@see ComparisonController::compareAction}.
     *
     * @return array
     *
     * @throws QueryException Query result is not unique.
     */
    public function getComparedGovernments(array $data)
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
                FROM {$this->environment}
                WHERE government_id = {$firstGovernmentId}
            ");

            $secondGovernmentData = $con->fetchAll("
                SELECT
                    '{$data['caption']}' AS caption,
                    {$data['fieldName']} AS amount,
                    '{$data['fieldName']}' AS fieldName
                FROM {$this->environment}
                WHERE government_id = {$secondGovernmentId}
            ");

            $data['firstGovernment']['data'] = $firstGovernmentData;
            $data['secondGovernment']['data'] = $secondGovernmentData;
        }

        return $data;
    }

    /**
     * @return string
     */
    public function getDefaultLocale()
    {
        return $this->getEntity()->getDefaultLocale()->getShortName();
    }

    /**
     * @param array $result
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
