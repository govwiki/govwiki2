<?php

namespace GovWiki\DbBundle\Entity\Repository;

use Doctrine\ORM\EntityRepository;
use GovWiki\RequestBundle\Entity\AbstractCreateRequest;

/**
 * PublicStatementRepository
 */
class PublicStatementRepository extends EntityRepository implements ListedEntityRepositoryInterface
{
    /**
     * {@inheritdoc}
     */
    public function getOne($id)
    {
        $expr = $this->_em->getExpressionBuilder();

        return $this->getQueryBuilder()
            ->where($expr->eq('PublicStatement.id', ':id'))
            ->setParameter('id', $id)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * {@inheritdoc}
     */
    public function getListQuery($electedOfficial, $user = null)
    {
        $qb = $this->getQueryBuilder();
        $expr = $qb->expr();

        $qb->where(
            $expr->eq('PublicStatement.electedOfficial', $electedOfficial)
        );

        if ($user) {
            $qb->andWhere($expr->orX(
                $expr->isNull('PublicStatement.request'),
                $expr->neq(
                    'Request.status',
                    $expr->literal(AbstractCreateRequest::STATE_DISCARDED)
                )
            ));
        } else {
            $qb->andWhere($expr->orX(
                $expr->isNull('PublicStatement.request'),
                $expr->eq(
                    'Request.status',
                    $expr->literal(AbstractCreateRequest::STATE_APPLIED)
                )
            ));
        }

        return $qb;
    }

    /**
     * {@inheritdoc}
     */
    public function getListQueryBySlugs($govAltTypeSlug, $govSlug, $eoSlug, $user = null)
    {
        $qb = $this->getQueryBuilder();
        $expr = $qb->expr();

        $qb
            ->join('PublicStatement.electedOfficial', 'ElectedOfficial')
            ->join('ElectedOfficial.government', 'Government')
            ->where($expr->andX(
                $expr->eq('Government.altTypeSlug', $expr->literal($govAltTypeSlug)),
                $expr->eq('Government.slug', $expr->literal($govSlug)),
                $expr->eq('ElectedOfficial.slug', $expr->literal($eoSlug))
            ));

        if ($user) {
            $qb->andWhere($expr->orX(
                $expr->isNull('PublicStatement.request'),
                $expr->neq(
                    'Request.status',
                    $expr->literal(AbstractCreateRequest::STATE_DISCARDED)
                )
            ));
        } else {
            $qb->andWhere($expr->orX(
                $expr->isNull('PublicStatement.request'),
                $expr->eq(
                    'Request.status',
                    $expr->literal(AbstractCreateRequest::STATE_APPLIED)
                )
            ));
        }

        return $qb;
    }

    /**
     * @return \Doctrine\ORM\QueryBuilder
     */
    private function getQueryBuilder()
    {
        return $this->createQueryBuilder('PublicStatement')
            ->addSelect('IssueCategory, Request, Creator')
            ->leftJoin('PublicStatement.request', 'Request')
            ->leftJoin('Request.creator', 'Creator')
            ->leftJoin('PublicStatement.issueCategory', 'IssueCategory');
    }
}
