<?php

namespace GovWiki\EnvironmentBundle\Manager\Environment;

use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Query\QueryException;
use GovWiki\DbBundle\Entity\Repository\GovernmentRepository;
use GovWiki\DbBundle\Utils\Functions;
use GovWiki\EnvironmentBundle\Storage\EnvironmentStorageInterface;
use GovWiki\EnvironmentBundle\Strategy\DefaultNamingStrategy;
use GovWiki\EnvironmentBundle\Strategy\NamingStrategyInterface;

/**
 * Interface EnvironmentManager
 * @package GovWiki\EnvironmentBundle\Manager
 */
class EnvironmentManager implements EnvironmentManagerInterface
{

    /**
     * @var EnvironmentStorageInterface
     */
    private $storage;

    /**
     * @var EntityManagerInterface
     */
    private $em;

    /**
     * @var NamingStrategyInterface
     */
    private $namingStrategy;

    public function __construct(
        EntityManagerInterface $em,
        EnvironmentStorageInterface $storage
    ) {
        $this->em = $em;
        $this->storage = $storage;
    }

    /**
     * {@inheritdoc}
     */
    public function getEnvironment()
    {
        return $this->storage->get();
    }

    /**
     * {@inheritdoc}
     */
    public function getFieldFormat($fieldName)
    {
        return $this->em->getRepository('GovWikiDbBundle:Format')
            ->getOne($this->getEnvironment()->getId(), $fieldName);
    }

    /**
     * {@inheritdoc}
     */
    public function getAvailableYears()
    {
        $con = $this->em->getConnection();
        $tableName = $this->getNamingStrategy()
            ->getEnvironmentRelatedTableName($this->getEnvironment());

        $years = $con->fetchAll("
            SELECT year
            FROM {$tableName}
            GROUP BY year
            ORDER BY year DESC
        ");

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
    public function computeElectedOfficialsCount()
    {
        $expr = $this->em->getExpressionBuilder();
        try {
            return $this->em->createQueryBuilder()
                ->from('GovWikiDbBundle:ElectedOfficial', 'eo')
                ->select($expr->count('eo.id'))
                ->join('eo.government', 'Government')
                ->where($expr->eq('Government.environment', ':environment'))
                ->setParameter('environment', $this->getEnvironment()->getId())
                ->getQuery()
                ->getSingleScalarResult();
        } catch (QueryException $e) {
            return 0;
        }
    }

    /**
     * {@inheritdoc}
     */
    public function getNamingStrategy()
    {
        if ($this->namingStrategy === null) {
            $this->namingStrategy = new DefaultNamingStrategy();
        }

        return $this->namingStrategy;
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

        return $repository->search($this->getEnvironment()->getId(), $partOfName);
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
            ->get($this->getEnvironment()->getId(), true);

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
            ->findGovernment($this->getEnvironment()->getId(), $altTypeSlug, $slug, $year);
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
}
