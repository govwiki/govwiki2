<?php

namespace GovWiki\DbBundle\Entity\Repository;

use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Query\Expr\Join;

/**
 * PublicStatementRepository
 */
class PublicStatementRepository extends EntityRepository
{
    /**
     * @param string $environment Environment name.
     *
     * @return \Doctrine\ORM\QueryBuilder
     */
    public function getListQuery($environment)
    {
        $qb = $this->createQueryBuilder('PublicStatement');
        $expr = $qb->expr();

        return $qb
            ->addSelect('IssueCategory')
            ->join('PublicStatement.issueCategory', 'IssueCategory')
            ->join('PublicStatement.electedOfficial', 'ElectedOfficial')
            ->join('ElectedOfficial.government', 'Government')
            ->join('Government.environment', 'Environment')
            ->where($expr->eq('Environment.slug', $expr->literal($environment)));
    }
}
