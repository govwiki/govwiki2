<?php

namespace GovWiki\DbBundle\Entity\Repository;

use Doctrine\ORM\EntityRepository;

/**
 * Class LegislationRepository
 * @package GovWiki\DbBundle\Entity\Repository
 */
class LegislationRepository extends EntityRepository
{
    /**
     * @param string $environment Environment name.
     *
     * @return \Doctrine\ORM\Query
     */
    public function getListQuery($environment)
    {
        $qb = $this->createQueryBuilder('Legislation');
        $expr = $qb->expr();

        return $qb
            ->leftJoin('Legislation.government', 'Government')
            ->leftJoin('Government.environment', 'Environment')
            ->where($expr->eq('Environment.name', $expr->literal($environment)))
            ->getQuery();
    }
}
