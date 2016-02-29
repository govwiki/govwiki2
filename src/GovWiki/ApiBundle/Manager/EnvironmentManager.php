<?php

namespace GovWiki\ApiBundle\Manager;

use CartoDbBundle\Service\CartoDbApi;
use Doctrine\DBAL\DBALException;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\ORMException;
use GovWiki\DbBundle\Entity\CreateRequest;
use GovWiki\DbBundle\Entity\EditRequest;
use GovWiki\DbBundle\Entity\ElectedOfficial;
use GovWiki\DbBundle\Entity\Environment;
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
        return $this->em->getRepository('GovWikiDbBundle:Map')
            ->get($this->environment);
    }

    /**
     * @return string
     */
    public function getTitle()
    {
        $qb = $this->em->getRepository('GovWikiDbBundle:Environment')
            ->createQueryBuilder('Environment');
        $expr = $qb->expr();

        return $qb
            ->select('Environment.title')
            ->where($expr->eq(
                'Environment.slug',
                $expr->literal($this->environment)
            ))
            ->getQuery()
            ->getSingleScalarResult();
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
                WHERE government_id = {$government['id']}
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
                SELECT m.*
                FROM {$tableName} m
                INNER JOIN environments e ON m.environment_id = e.id
                WHERE
                    e.slug = '{$this->environment}' AND
                    m.alt_type_slug = '{$altTypeSlug}'
            ");
        } catch (DBALException $e) {
            $this->computer->compute($this->environment);
            $data = $con->fetchAssoc("
                SELECT m.*
                FROM {$tableName} m
                INNER JOIN environments e ON m.environment_id = e.id
                WHERE
                    e.slug = '{$this->environment}' AND
                    m.alt_type_slug = '{$altTypeSlug}'
            ");
        }

        if (count($data) > 0) {
            unset($data['alt_type_slug'], $data['environment_id']);
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

        /*
         * Replace single and double quote to html special char.
         */
        $governmentJson = json_encode($government);

        return [
            'government' => $government,
            'government_json' => $governmentJson,
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
        $rankFieldName = $parameters['field_name'];
        $limit = $parameters['limit'];
        $page = $parameters['page'];
        $order = $parameters['order'];
        $nameOrder = $parameters['name_order'];

        return $this->em->getRepository('GovWikiDbBundle:Government')
            ->getGovernmentRank(
                $this->environment,
                $altTypeSlug,
                $slug,
                $rankFieldName,
                $limit,
                $page,
                $order,
                $nameOrder
            );
    }

    /**
     * @return array|null
     */
    public function getStyle()
    {
        return $this->em->getRepository('GovWikiDbBundle:Environment')
            ->getStyle($this->environment);
    }

    /**
     * @param string $altTypeSlug Slugged government alt type.
     * @param string $slug        Slugged government name.
     * @param string $eoSlug      Slugged elected official full name.
     *
     * @return array|null
     */
    public function getElectedOfficial($altTypeSlug, $slug, $eoSlug)
    {
        $electedOfficial = $this->em->getRepository('GovWikiDbBundle:ElectedOfficial')
            ->findOne($this->environment, $altTypeSlug, $slug, $eoSlug);

        if (null !== $electedOfficial) {

            /*
            * Create queries for legislations, contributions and etc.
            */
            $votes = $this->em->getRepository('GovWikiDbBundle:ElectedOfficialVote')
                ->getListQuery($electedOfficial['id']);
            $contributions = $this->em->getRepository('GovWikiDbBundle:Contribution')
                ->getListQuery($electedOfficial['id']);
            $endorsements = $this->em->getRepository('GovWikiDbBundle:Endorsement')
                ->getListQuery($electedOfficial['id']);
            $publicStatements = $this->em->getRepository('GovWikiDbBundle:PublicStatement')
                ->getListQuery($electedOfficial['id']);

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
     * Create new create request and sets it environment.
     *
     * @return CreateRequest
     */
    public function createCreateRequest() // Sorry :-)
    {
        $createRequest = new CreateRequest();
        return $createRequest->setEnvironment(
            $this->em->getRepository('GovWikiDbBundle:Environment')
                ->getReferenceByName($this->environment)
        );
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
}
