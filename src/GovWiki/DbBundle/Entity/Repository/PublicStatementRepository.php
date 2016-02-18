<?php

namespace GovWiki\DbBundle\Entity\Repository;

use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Query\Expr\Join;
use GovWiki\RequestBundle\Entity\AbstractCreateRequest;

/**
 * PublicStatementRepository
 */
class PublicStatementRepository extends EntityRepository implements ListedEntityRepositoryInterface
{

    /**
     * @param integer $electedOfficial Elected official entity id.
     *
     * @return \Doctrine\ORM\QueryBuilder
     */
    public function getListQuery($electedOfficial)
    {
        $qb = $this->createQueryBuilder('PublicStatement');
        $expr = $qb->expr();

        return $qb
            ->addSelect('IssueCategory, Request, Creator')
            ->leftJoin('PublicStatement.request', 'Request')
            ->leftJoin('Request.creator', 'Creator')
            ->join('PublicStatement.issueCategory', 'IssueCategory')
            ->where($expr->andX(
                $expr->eq('PublicStatement.electedOfficial', $electedOfficial),
                $expr->orX(
                    $expr->isNull('PublicStatement.request'),
                    $expr->neq(
                        'Request.status',
                        $expr->literal(AbstractCreateRequest::STATE_DISCARDED)
                    )
                )
            ));
    }

    /**
     * {@inheritdoc}
     */
    public function getListQueryBySlugs($govAltTypeSlug, $govSlug, $eoSlug)
    {
        $qb = $this->createQueryBuilder('PublicStatement');
        $expr = $qb->expr();

        return $qb
            ->addSelect('IssueCategory, Request, Creator')
            ->leftJoin('PublicStatement.request', 'Request')
            ->leftJoin('Request.creator', 'Creator')
            ->join('PublicStatement.issueCategory', 'IssueCategory')
            ->join('PublicStatement.electedOfficial', 'ElectedOfficial')
            ->join('ElectedOfficial.government', 'Government')
            ->where($expr->andX(
                $expr->andX(
                    $expr->eq('Government.altTypeSlug', $expr->literal($govAltTypeSlug)),
                    $expr->eq('Government.slug', $expr->literal($govSlug)),
                    $expr->eq('ElectedOfficial.slug', $expr->literal($eoSlug))
                ),
                $expr->orX(
                    $expr->isNull('PublicStatement.request'),
                    $expr->neq(
                        'Request.status',
                        $expr->literal(AbstractCreateRequest::STATE_DISCARDED)
                    )
                )
            ));
    }
}
