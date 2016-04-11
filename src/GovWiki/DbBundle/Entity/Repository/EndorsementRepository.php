<?php

namespace GovWiki\DbBundle\Entity\Repository;

use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Query\Expr\Join;
use GovWiki\RequestBundle\Entity\AbstractCreateRequest;

/**
 * EndorsementRepository
 */
class EndorsementRepository extends EntityRepository implements ListedEntityRepositoryInterface
{

    /**
     * @param integer $electedOfficial Elected official entity id.
     * @param integer $user            User entity id.
     *
     * @return \Doctrine\ORM\QueryBuilder
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
