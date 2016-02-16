<?php

namespace GovWiki\DbBundle\Entity\Repository;

use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Query\Expr\Join;
use GovWiki\RequestBundle\Entity\AbstractCreateRequest;

/**
 * ElectedOfficialVoteRepository
 */
class ElectedOfficialVoteRepository extends EntityRepository
{
    /**
     * @param integer $electedOfficial Elected official entity id.
     *
     * @return \Doctrine\ORM\QueryBuilder
     */
    public function getListQuery($electedOfficial)
    {
        $qb = $this->createQueryBuilder('Vote');
        $expr = $qb->expr();

        return $qb
            ->addSelect('Legislation, Comment, Request, Creator')
            ->join('Vote.legislation', 'Legislation')
            ->leftJoin('Legislation.request', 'Request')
            ->leftJoin('Request.creator', 'Creator')
            ->leftJoin('Vote.comments', 'Comment')
            ->where($expr->andX(
                $expr->eq('Vote.electedOfficial', $electedOfficial),
                $expr->orX(
                    $expr->isNull('Legislation.request'),
                    $expr->neq(
                        'Request.status',
                        $expr->literal(AbstractCreateRequest::STATE_DISCARDED)
                    )
                )
            ));
    }
}
