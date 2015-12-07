<?php

namespace GovWiki\DbBundle\Entity\Repository;

use Doctrine\ORM\EntityRepository;

/**
 * EnvironmentRepository
 */
class EnvironmentRepository extends EntityRepository
{
    /**
     * @param string $name Map name.
     *
     * @return array|null
     */
    public function getByName($name)
    {
        $qb = $this->createQueryBuilder('Environment');
        $expr = $qb->expr();

        $environment = $qb
            ->addSelect(
                'Map',
                'partial Government.{id,name,type,slug,altType,altTypeSlug,latitude,longitude}'
            )
            ->leftJoin('Environment.map', 'Map')
            ->leftJoin('Map.governments', 'Government')
            ->where($expr->eq('Environment.name', $expr->literal($name)))
            ->getQuery()
            ->getArrayResult();

        if (count($environment) > 0) {
            return $environment[0];
        }

        return $environment;
    }
}
