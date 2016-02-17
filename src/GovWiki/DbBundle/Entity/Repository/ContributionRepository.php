<?php

namespace GovWiki\DbBundle\Entity\Repository;

use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Query\Expr\Join;
use GovWiki\RequestBundle\Entity\AbstractCreateRequest;

/**
 * ContributionRepository
 */
class ContributionRepository extends EntityRepository implements ListedEntityRepositoryInterface
{

    /**
     * @param integer $electedOfficial Elected official entity id.
     *
     * @return \Doctrine\ORM\QueryBuilder
     */
    public function getListQuery($electedOfficial)
    {
        $qb = $this->createQueryBuilder('Contribution');
        $expr = $qb->expr();

        return $qb
            ->addSelect('Request, Creator')
            ->leftJoin('Contribution.request', 'Request')
            ->leftJoin('Request.creator', 'Creator')
            ->where($expr->andX(
                $expr->eq('Contribution.electedOfficial', $electedOfficial),
                $expr->orX(
                    $expr->isNull('Contribution.request'),
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
        $qb = $this->createQueryBuilder('Contribution');
        $expr = $qb->expr();

        return $qb
            ->addSelect('Request, Creator')
            ->leftJoin('Contribution.request', 'Request')
            ->leftJoin('Request.creator', 'Creator')
            ->join('Contribution.electedOfficial', 'ElectedOfficial')
            ->join('ElectedOfficial.government', 'Government')
            ->where($expr->andX(
                $expr->andX(
                    $expr->eq('Government.altTypeSlug', $expr->literal($govAltTypeSlug)),
                    $expr->eq('Government.slug', $expr->literal($govSlug)),
                    $expr->eq('ElectedOfficial.slug', $expr->literal($eoSlug))
                ),
                $expr->orX(
                    $expr->isNull('Contribution.request'),
                    $expr->neq(
                        'Request.status',
                        $expr->literal(AbstractCreateRequest::STATE_DISCARDED)
                    )
                )
            ));
    }
}
