<?php

namespace GovWiki\DbBundle\Entity\Repository;

use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Query\Expr\Join;

/**
 * EndorsementRepository
 */
class EndorsementRepository extends EntityRepository
{
    /**
     * @param string $environment Environment name.
     *
     * @return \Doctrine\ORM\QueryBuilder
     */
    public function getListQuery($environment)
    {
        $qb = $this->createQueryBuilder('Endorsement');
        $expr = $qb->expr();

        return $qb
            ->addSelect('IssueCategory')
            ->join('Endorsement.issueCategory', 'IssueCategory')
            ->join('Endorsement.electedOfficial', 'ElectedOfficial')
            ->join('ElectedOfficial.government', 'Government')
            ->join('Government.environment', 'Environment')
            ->where($expr->eq('Environment.slug', $expr->literal($environment)));
    }
}
