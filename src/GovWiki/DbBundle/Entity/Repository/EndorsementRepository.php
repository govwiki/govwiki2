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
     *
     * @return \Doctrine\ORM\QueryBuilder
     */
    public function getListQuery($electedOfficial)
    {
        $qb = $this->createQueryBuilder('Endorsement');
        $expr = $qb->expr();

        $qb
            ->addSelect('IssueCategory, Request, Creator')
            ->leftJoin('Endorsement.request', 'Request')
            ->leftJoin('Request.creator', 'Creator')
            ->leftJoin('Endorsement.issueCategory', 'IssueCategory')
            ->where($expr->andX(
                $expr->eq('Endorsement.electedOfficial', $electedOfficial),
                $expr->orX(
                    $expr->isNull('Endorsement.request'),
                    $expr->neq(
                        'Request.status',
                        $expr->literal(AbstractCreateRequest::STATE_DISCARDED)
                    )
                )
            ));

        dump($qb->getQuery()->getSQL());

        return $qb;
    }

    /**
     * {@inheritdoc}
     */
    public function getListQueryBySlugs($govAltTypeSlug, $govSlug, $eoSlug)
    {
        $qb = $this->createQueryBuilder('Endorsement');
        $expr = $qb->expr();

        return $qb
            ->addSelect('IssueCategory, Request, Creator')
            ->leftJoin('Endorsement.request', 'Request')
            ->leftJoin('Request.creator', 'Creator')
            ->leftJoin('Endorsement.issueCategory', 'IssueCategory')
            ->join('Endorsement.electedOfficial', 'ElectedOfficial')
            ->join('ElectedOfficial.government', 'Government')
            ->where($expr->andX(
                $expr->andX(
                    $expr->eq('Government.altTypeSlug', $expr->literal($govAltTypeSlug)),
                    $expr->eq('Government.slug', $expr->literal($govSlug)),
                    $expr->eq('ElectedOfficial.slug', $expr->literal($eoSlug))
                ),
                $expr->orX(
                    $expr->isNull('Endorsement.request'),
                    $expr->neq(
                        'Request.status',
                        $expr->literal(AbstractCreateRequest::STATE_DISCARDED)
                    )
                )
            ));
    }
}
