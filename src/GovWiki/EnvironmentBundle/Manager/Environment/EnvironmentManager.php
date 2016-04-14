<?php

namespace GovWiki\EnvironmentBundle\Manager\Environment;

use Doctrine\DBAL\DBALException;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Query\QueryException;
use GovWiki\DbBundle\Entity\Repository\ElectedOfficialRepository;
use GovWiki\DbBundle\Entity\Repository\GovernmentRepository;
use GovWiki\DbBundle\Utils\Functions;
use GovWiki\EnvironmentBundle\Manager\Data\DataManagerPool;
use GovWiki\EnvironmentBundle\Manager\Data\DataManagerPoolInterface;
use GovWiki\EnvironmentBundle\Manager\Data\Government\GovernmentManagerInterface;
use GovWiki\EnvironmentBundle\Manager\Data\MaxRank\MaxRankManagerInterface;
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
     * @var EntityManagerInterface
     */
    private $em;

    /**
     * @var EnvironmentStorageInterface
     */
    private $storage;

    /**
     * @var GovernmentManagerInterface
     */
    private $governmentManager;

    /**
     * @var MaxRankManagerInterface
     */
    private $maxRankManager;

    public function __construct(
        EntityManagerInterface $em,
        EnvironmentStorageInterface $storage,
        GovernmentManagerInterface $governmentManager,
        MaxRankManagerInterface $maxRankManager
    ) {
        $this->em = $em;
        $this->storage = $storage;
        $this->governmentManager = $governmentManager;
        $this->maxRankManager = $maxRankManager;
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
        $tableName = DefaultNamingStrategy::environmentRelatedTableName(
            $this->getEnvironment()
        );

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
     * @param string  $altTypeSlug Slugged government alt type.
     * @param string  $slug        Slugged government name.
     * @param integer $year        For fetching fin data.
     *
     * @return array
     */
    public function getGovernment($altTypeSlug, $slug, $year = null)
    {
        $altType = str_replace('_', ' ', $altTypeSlug);
        $fields = $this->em->getRepository('GovWikiDbBundle:Format')
            ->getList($this->getEnvironment()->getId(), $altType);

        /*
         * Get array of formats fields.
         */
        $formats = array_filter(
            $fields,
            function (array $format) {
                return $format['dataOrFormula'] === 'data';
            }
        );
        $formats = array_values($formats); // In order to make new keys.

        /*
         *  Fetch government.
         */
        $government = $this->em->getRepository('GovWikiDbBundle:Government')
            ->findGovernment(
                $this->getEnvironment()->getId(),
                $altTypeSlug,
                $slug,
                $year
            );

        /*
         * Fetch environment related government data if at least one field
         * showing for given alt type.
         */
        $dataFields = [];
        foreach ($fields as $field) {
            $dataFields[$field['field']] = $field['type'];
            if ($field['ranked'] === true) {
                $name = DefaultNamingStrategy::rankedFieldName($field['field']);
                $dataFields[$name] = 'integer';
            }
        }

        $data = $this->governmentManager
            ->get($this->getEnvironment(), $government['id'], $year, $dataFields);
        $government = array_merge($government, $data);
        unset($data, $dataFields);

        /*
         * Get max ranks.
         */
        $data = $this->maxRankManager->get(
            $this->getEnvironment(),
            $altTypeSlug,
            $year
        );
        if ($data === false) {
            $this->maxRankManager->computeAndSave(
                $this->getEnvironment(),
                $fields,
                $year
            );
            $data = $this->maxRankManager->get(
                $this->getEnvironment(),
                $altTypeSlug,
                $year
            );
        }
        $government['ranks'] = $data;

        if (count($data) > 0) {
            unset($data['alt_type_slug'], $data['year']);
            foreach ($data as $field => $value) {
                if (array_key_exists($field, $government)) {
                    $rankName = DefaultNamingStrategy::rankedFieldName($field);
                    $government['ranks'][$rankName] = [
                        $government[$rankName],
                        $value,
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
     * @return array
     */
    public function getRankedFields()
    {
        return $this->em->getRepository('GovWikiDbBundle:Format')
            ->getRankedFields($this->getEnvironment()->getId());
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
                $this->getEnvironment()->getId(),
                $altTypeSlug,
                $slug,
                $parameters
            );
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
        return $repository->search($this->getEnvironment()->getId(), $partOfName);
    }

    /**
     * @param string  $altTypeSlug Slugged government alt type.
     * @param string  $slug        Slugged government name.
     * @param string  $eoSlug      Slugged elected official full name.
     * @param integer $user        User entity id.
     *
     * @return array|null
     */
    public function getElectedOfficial($altTypeSlug, $slug, $eoSlug, $user = null)
    {
        $electedOfficial = $this->em->getRepository('GovWikiDbBundle:ElectedOfficial')
            ->findOne($this->getEnvironment()->getId(), $altTypeSlug, $slug, $eoSlug);

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
}
