<?php

namespace GovWiki\DbBundle\Entity\Repository;

use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\NonUniqueResultException;

/**
 * MapRepository
 */
class MapRepository extends EntityRepository
{
    /**
     * @return \Doctrine\ORM\Query
     */
    public function listQuery()
    {
        $qb = $this->createQueryBuilder('Map');
        $expr = $qb->expr();

        return $qb
            ->select('partial Map.{id,name,vizUrl}')
            ->orderBy($expr->asc('Map.name'))
            ->getQuery();
    }

    /**
     * @param string $environment Environment name.
     *
     * @return mixed
     */
    public function getByEnvironment($environment)
    {
        $qb = $this->createQueryBuilder('Map');
        $expr = $qb->expr();

        try {
            return $qb
                ->select('partial Map.{id,itemQueueId}')
                ->join('Map.environment', 'Environment')
                ->where($expr->eq('Environment.name', $expr->literal($environment)))
                ->getQuery()
                ->getOneOrNullResult();
        } catch (NonUniqueResultException $e) {
            return null;
        }
    }

    /**
     * @param string $name Map name.
     *
     * @return array|null
     */
    public function getWithGovernments($name)
    {
        $qb = $this->createQueryBuilder('Map');
        $expr = $qb->expr();

        $map = $qb
            ->addSelect(
                'partial Government.{id,name,type,slug,altType,altTypeSlug,latitude,longitude}'
            )
            ->leftJoin('Map.governments', 'Government')
            ->where($expr->eq('Map.name', $expr->literal($name)))
            ->getQuery()
            ->getArrayResult();

        if (count($map) > 0) {
            return $map[0];
        }

        return null;
    }
}
