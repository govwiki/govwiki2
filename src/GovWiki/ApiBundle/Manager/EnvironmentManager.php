<?php

namespace GovWiki\ApiBundle\Manager;

use CartoDbBundle\Service\CartoDbApi;
use Doctrine\ORM\EntityManagerInterface;
use GovWiki\DbBundle\Entity\CreateRequest;
use GovWiki\DbBundle\Entity\EditRequest;
use GovWiki\DbBundle\Entity\ElectedOfficial;
use GovWiki\DbBundle\Entity\Environment;
use GovWiki\DbBundle\Entity\Map;
use GovWiki\DbBundle\Entity\Repository\GovernmentRepository;
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
     * @return Map|null
     *
     * @throws NotFoundHttpException Import process failed.
     */
    public function getMap()
    {
        $map = $this->em->getRepository('GovWikiDbBundle:Map')
            ->get($this->environment);

        if (null !== $map->getItemQueueId()) {
            /*
             * Check map import status.
             */
            $result = $this->api
                ->checkImportProcess($map->getItemQueueId());

            if (true === $result['success']) {
                if ('complete' === $result['state']) {
                    $map->setCreated(true);
                    $map->setVizUrl($this->api->getVizUrl($result));
                    $map->setItemQueueId(null);

                    $this->em->persist($map);
                    $this->em->flush();

                } elseif ('failed' === $result['state']) {
                    throw new NotFoundHttpException('Map not imported.');
                }
            }
        }

        return $map;
    }

    /**
     * @return string
     */
    public function getGreetingText()
    {
        $qb = $this->em->getRepository('GovWikiDbBundle:Environment')
            ->createQueryBuilder('Environment');
        $expr = $qb->expr();

        return $qb
            ->select('Environment.greetingText')
            ->where($expr->eq('Environment.slug', $expr->literal($this->environment)))
            ->getQuery()
            ->getSingleScalarResult();
    }

    /**
     * @param string $altTypeSlug Slugged government alt type.
     * @param string $slug        Slugged government name.
     *
     * @return array
     */
    public function getGovernment($altTypeSlug, $slug)
    {
        $formats = $this->em->getRepository('GovWikiDbBundle:Format')
            ->get($this->environment, true);

        /*
         * Get array of fields and array of ranked fields.
         */
        $fields = [];
        $rankedFields = [];
        $altType = str_replace('_', ' ', $altTypeSlug);
        foreach ($formats as $format) {
            if (in_array($altType, $format['showIn'], true)) {
                $fields[] = $format['field'];
                if (true === $format['ranked']) {
                    $rankedFieldName = $format['field'] . '_rank';
                    $fields[] = $rankedFieldName;
                    $rankedFields[] =
                        'MAX(' . $rankedFieldName . ') as ' .
                        $rankedFieldName;
                }
            }
        }

        $government = $this->em->getRepository('GovWikiDbBundle:Government')
            ->findGovernment($this->environment, $altTypeSlug, $slug);
        if (null === $government) {
            return [];
        }

        $fields = implode(',', $fields);
        $data = $this->em->getConnection()->fetchAssoc("
            SELECT {$fields} FROM {$this->environment}
            WHERE government_id = {$government['id']}
        ");
        $government = array_merge($government, $data);

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