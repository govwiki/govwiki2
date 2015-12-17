<?php

namespace GovWiki\ApiBundle\Manager;

use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Tools\Pagination\Paginator;

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
     * @var string
     */
    private $environment;

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
    public function setEnvironment($environment)
    {
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
     * Get used alt types by government in current environment.
     *
     * @return array|null
     */
    public function getUsedAltTypes()
    {
        $qb =  $this->em->createQueryBuilder()
            ->select('Government.altType')
            ->from('GovWikiDbBundle:Government', 'Government');
        $expr = $qb->expr();

        $tmp = $qb
            ->leftJoin('Government.environment', 'Environment')
            ->where($expr->eq(
                'Environment.name',
                $expr->literal($this->environment)
            ))
            ->groupBy('Government.altType')
            ->orderBy('Government.altType')
            ->getQuery()
            ->getArrayResult();

        if (count($tmp) > 0) {
            $result = [];
            foreach ($tmp as $row) {
                $result[$row['altType']] = $row['altType'];
            }

            return $result;
        }
        return [];
    }

    /**
     * @return array|null
     */
    public function getMap()
    {
        return $this->em->getRepository('GovWikiDbBundle:Map')
            ->getWithGovernments($this->environment);
    }

    /**
     * @param string $altTypeSlug Slugged government alt type.
     * @param string $slug        Slugged government name.
     *
     * @return array
     */
    public function getGovernment($altTypeSlug, $slug)
    {

        return [
            'government' => $this->em->getRepository('GovWikiDbBundle:Government')
                ->findGovernment($this->environment, $altTypeSlug, $slug),
            'formats' => $this->em->getRepository('GovWikiDbBundle:Format')
                ->get($this->environment),
            'tabs' => $this->em->getRepository('GovWikiDbBundle:Tab')
                ->getNames($this->environment),
        ];
    }

    /**
     * @param string $altTypeSlug Slugged government alt type.
     * @param string $slug        Slugged government name.
     * @param string $eoSlug      Slugged elected official full name.
     *
     * @return array
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
                'issuesCategory' => $this->em
                    ->getRepository('GovWikiDbBundle:IssueCategory')
                    ->findAll(),
            ];
        }

        return null;
    }
}
