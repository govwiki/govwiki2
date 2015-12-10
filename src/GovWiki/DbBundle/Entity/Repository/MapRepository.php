<?php

namespace GovWiki\DbBundle\Entity\Repository;

use Doctrine\ORM\EntityRepository;

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
     * @param $name
     *
     * @return mixed
     * @throws \Doctrine\ORM\NonUniqueResultException
     */
    public function get($name)
    {
        $qb = $this->createQueryBuilder('Map');
        $expr = $qb->expr();

        return $qb
            ->select('partial Map.{id,name,itemQueueId}')
            ->where($expr->eq('Map.name', $expr->literal($name)))
            ->getQuery()
            ->getOneOrNullResult();
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
