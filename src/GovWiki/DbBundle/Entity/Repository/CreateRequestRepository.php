<?php

namespace GovWiki\DbBundle\Entity\Repository;

use Doctrine\ORM\EntityRepository;
use GovWiki\DbBundle\Entity\ElectedOfficial;

/**
 * CreateRequestRepository
 */
class CreateRequestRepository extends EntityRepository
{
    /**
     * @param string $environment Environment name.
     *
     * @return \Doctrine\ORM\Query
     */
    public function getListQuery($environment)
    {
        $qb = $this->createQueryBuilder('CreateRequest');
        $expr = $qb->expr();

        return $qb
            ->addSelect('User')
            ->leftJoin('CreateRequest.user', 'User')
            ->leftJoin('CreateRequest.environment', 'Environment')
            ->where($expr->andX(
                $expr->neq('CreateRequest.status', $expr->literal('discarded')),
                $expr->eq('Environment.name', $expr->literal($environment))
            ))
            ->getQuery();
    }

    /**
     * Get all create request for given elected official.
     *
     * @param integer $electedOfficial Elected official id.
     *
     * @return ElectedOfficial[]
     */
    public function getCreateRequestFor($electedOfficial)
    {
        $qb = $this->createQueryBuilder('CreateRequest');
        return $qb
            ->where("regexp('electedOfficial\";s:7:\"$electedOfficial', CreateRequest.fields) != false")
            ->andWhere(
                $qb->expr()->neq(
                    'CreateRequest.status',
                    $qb->expr()->literal('applied')
                )
            )
            ->getQuery()
            ->getResult();
    }
}
