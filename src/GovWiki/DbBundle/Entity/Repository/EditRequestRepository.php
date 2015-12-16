<?php

namespace GovWiki\DbBundle\Entity\Repository;

use Doctrine\ORM\EntityRepository;
use GovWiki\DbBundle\Entity\ElectedOfficial;

/**
 * EditRequestRepository
 */
class EditRequestRepository extends EntityRepository
{
    /**
     * @param string $environment Environment name.
     *
     * @return \Doctrine\ORM\Query
     */
    public function getListQuery($environment)
    {
        $qb = $this->createQueryBuilder('EditRequest');
        $expr = $qb->expr();

        return $qb
            ->addSelect('User')
            ->leftJoin('EditRequest.user', 'User')
            ->leftJoin('EditRequest.environment', 'Environment')
            ->where($expr->andX(
                $expr->neq('EditRequest.status', $expr->literal('discarded')),
                $expr->eq('Environment.name', $expr->literal($environment))
            ))
            ->getQuery();
    }
}
