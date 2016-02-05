<?php

namespace GovWiki\ApiBundle\Manager;

use CartoDbBundle\Service\CartoDbApi;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\ORMException;
use Doctrine\ORM\Query\ResultSetMappingBuilder;
use GovWiki\DbBundle\Entity\CreateRequest;
use GovWiki\DbBundle\Entity\EditRequest;
use GovWiki\DbBundle\Entity\ElectedOfficial;
use GovWiki\DbBundle\Entity\Environment;
use GovWiki\DbBundle\Entity\Map;
use GovWiki\DbBundle\Entity\Repository\GovernmentRepository;
use GovWiki\DbBundle\Entity\Repository\ElectedOfficialRepository;
use GovWiki\DbBundle\Utils\Functions;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

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
     * @param EntityManagerInterface $em  A EntityManagerInterface instance.
     * @param CartoDbApi             $api A CartoDbApi instance.
     */
    public function __construct(EntityManagerInterface $em, CartoDbApi $api)
    {
        $this->em = $em;
        $this->api = $api;
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
     * @return string
     */
    public function getGreetingText()
    {
        $qb = $this->em->getRepository('GovWikiDbBundle:Environment')
            ->createQueryBuilder('Environment');
        $expr = $qb->expr();

        try {
            return $qb
                ->select('Environment.greetingText')
                ->where($expr->eq('Environment.slug', $expr->literal($this->environment)))
                ->getQuery()
                ->getSingleScalarResult();
        } catch (ORMException $e) {
            return '';
        }
    }

    /**
     * @return null|string
     */
    public function getBottomText()
    {
        $qb = $this->em->getRepository('GovWikiDbBundle:Environment')
            ->createQueryBuilder('Environment');
        $expr = $qb->expr();

        try {
            return $qb
                ->select('Environment.bottomText')
                ->where(
                    $expr->andX(
                        $expr->eq(
                            'Environment.slug',
                            $expr->literal($this->environment)
                        ),
                        $expr->eq('Environment.showBottomText', 1)
                    )
                )
                ->getQuery()
                ->getSingleScalarResult();
        } catch (ORMException $e) {
            return '';
        }
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
     * @param string $altTypeSlug Slugged government alt type.
     * @param string $slug        Slugged government name.
     *
     * @return array
     */
    public function getGovernment($altTypeSlug, $slug)
    {
        $tmp = $this->em->getRepository('GovWikiDbBundle:Format')
            ->get($this->environment, true);

        /*
         * Get array of fields and array of ranked fields.
         */
        $fields = [];
        $rankedFields = [];
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
                        $rankedFields[] =
                            'MAX(' . $rankedFieldName . ') AS ' .
                            $rankedFieldName;
                    }
                }

            }
        }

        $government = $this->em->getRepository('GovWikiDbBundle:Government')
            ->findGovernment($this->environment, $altTypeSlug, $slug);
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
         * Compute max ranks.
         */
        $government['ranks'] = [];
        if (count($rankedFields) > 0) {
            $rankedFields = implode(',', $rankedFields);

            $ranks = $this->em->getConnection()->fetchAssoc("
                SELECT {$rankedFields} FROM {$this->environment}
            ");

            if (count($ranks) > 0) {
                foreach ($ranks as $field => $value) {
                    $government['ranks'][$field] = [ $government[$field], $value ];
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
        /*$governmentJson = str_replace(
            [ '\'', '\\"' ],
            [ '&apos;', '&quote;' ],
            json_encode($government)
        );*/

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
        $data = $this->em->getRepository('GovWikiDbBundle:ElectedOfficial')
            ->findOne($this->environment, $altTypeSlug, $slug, $eoSlug);

        $dataCount = count($data);
        if ($dataCount > 0) {
            $electedOfficial = $data[0];
            $createRequests = [];
            for ($i = 1; $i < $dataCount; $i++) {
                $createRequests[] = $data[$i];
            }

            return [
                'electedOfficial' => $electedOfficial,
                'createRequests' => $createRequests,
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
