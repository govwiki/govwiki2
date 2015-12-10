<?php

namespace GovWiki\ApiBundle\Manager;

use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Tools\Pagination\Paginator;

/**
 * Class EnvironmentManager
 * @package GovWiki\ApiBundle\Manager
 */
class EnvironmentManager
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
     * @param string $environment Environment name, same as map name.
     *
     * @return EnvironmentManager
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
     * @return array|null
     */
    public function getMap()
    {
        return $this->em->getRepository('GovWikiDbBundle:Map')
            ->getWithGovernments($this->environment);
    }

    /**
     * @param integer $page  Current page index.
     * @param integer $limit Max governments per page.
     *
     * @return Paginator
     */
    public function listGovernments(
        $page,
        $limit,
        $sort = null,
        $direction = null
    ) {
        $qb = $this->em->getRepository('GovWikiDbBundle:Government')
            ->createQueryBuilder('Government');
        $expr = $qb->expr();

        if (null !== $sort) {
            $field = "Government.{$sort}";
            if ('desc' === $direction) {
                $qb->orderBy($expr->desc($field));
            } else {
                $qb->orderBy($expr->asc($field));
            }
        }

        return new Paginator(
            $qb
                ->select('partial Government.{id,name,slug,type,altType}')
                ->leftJoin('Government.map', 'Map')
                ->where(
                    $expr->eq('Map.name', $expr->literal($this->environment))
                )
                ->setFirstResult($page * $limit)
                ->setMaxResults($limit),
            false
        );
    }
}
