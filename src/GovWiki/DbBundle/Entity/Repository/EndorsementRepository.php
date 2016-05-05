<?php

namespace GovWiki\DbBundle\Entity\Repository;

use Doctrine\ORM\EntityRepository;
use GovWiki\RequestBundle\Entity\AbstractCreateRequest;

/**
 * EndorsementRepository
 */
class EndorsementRepository extends EntityRepository implements ListedEntityRepositoryInterface
{

    /**
     * {@inheritdoc}
     */
    public function getOne($id)
    {
        $expr = $this->_em->getExpressionBuilder();

        return $this->createQueryBuilder('Endorsement')
            ->addSelect('IssueCategory, Request, Creator')
            ->leftJoin('Endorsement.request', 'Request')
            ->leftJoin('Request.creator', 'Creator')
            ->leftJoin('Endorsement.issueCategory', 'IssueCategory')
            ->where($expr->eq('Endorsement.id', ':id'))
            ->setParameter('id', $id)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * {@inheritdoc}
     */
    public function getListQuery($electedOfficial, $user = null)
    {
        $qb = $this->createQueryBuilder('Endorsement');
        $expr = $qb->expr();

        $qb
            ->addSelect('IssueCategory, Request, Creator')
            ->leftJoin('Endorsement.request', 'Request')
            ->leftJoin('Request.creator', 'Creator')
            ->leftJoin('Endorsement.issueCategory', 'IssueCategory')
            ->where($expr->eq('Endorsement.electedOfficial', $electedOfficial));

        if ($user) {
            $qb->andWhere($expr->orX(
                $expr->isNull('Endorsement.request'),
                $expr->neq(
                    'Request.status',
                    $expr->literal(AbstractCreateRequest::STATE_DISCARDED)
                )
            ));
        } else {
            $qb->andWhere($expr->orX(
                $expr->isNull('Endorsement.request'),
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
        $qb = $this->createQueryBuilder('Endorsement');
        $expr = $qb->expr();

        $qb
            ->addSelect('IssueCategory, Request, Creator')
            ->leftJoin('Endorsement.request', 'Request')
            ->leftJoin('Request.creator', 'Creator')
            ->leftJoin('Endorsement.issueCategory', 'IssueCategory')
            ->join('Endorsement.electedOfficial', 'ElectedOfficial')
            ->join('ElectedOfficial.government', 'Government')
            ->where($expr->andX(
                $expr->eq('Government.altTypeSlug', $expr->literal($govAltTypeSlug)),
                $expr->eq('Government.slug', $expr->literal($govSlug)),
                $expr->eq('ElectedOfficial.slug', $expr->literal($eoSlug))
            ));

        if ($user) {
            $qb->andWhere($expr->orX(
                $expr->isNull('Endorsement.request'),
                $expr->neq(
                    'Request.status',
                    $expr->literal(AbstractCreateRequest::STATE_DISCARDED)
                )
            ));
        } else {
            $qb->andWhere($expr->orX(
                $expr->isNull('Endorsement.request'),
                $expr->eq(
                    'Request.status',
                    $expr->literal(AbstractCreateRequest::STATE_APPLIED)
                )
            ));
        }

        return $qb;
    }
}
