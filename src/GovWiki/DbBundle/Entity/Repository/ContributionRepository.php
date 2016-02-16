<?php

namespace GovWiki\DbBundle\Entity\Repository;

use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Query\Expr\Join;

/**
 * ContributionRepository
 */
class ContributionRepository extends EntityRepository
{
    /**
     * @param string $environment Environment name.
     *
     * @return \Doctrine\ORM\QueryBuilder
     */
    public function getListQuery($environment)
    {
        $qb = $this->createQueryBuilder('Contribution');
        $expr = $qb->expr();

        return $qb
            ->join('Contribution.electedOfficial', 'ElectedOfficial')
            ->join('ElectedOfficial.government', 'Government')
            ->join('Government.environment', 'Environment')
            ->where($expr->eq('Environment.slug', $expr->literal($environment)));
    }
}
