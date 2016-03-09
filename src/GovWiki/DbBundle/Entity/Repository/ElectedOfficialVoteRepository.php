<?php

namespace GovWiki\DbBundle\Entity\Repository;

use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Query\Expr\Join;
use GovWiki\RequestBundle\Entity\AbstractCreateRequest;

/**
 * ElectedOfficialVoteRepository
 */
class ElectedOfficialVoteRepository extends EntityRepository implements ListedEntityRepositoryInterface
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

        $now = (new \DateTime())->format('Y-m-d H:i:s');

        return $qb
            ->addSelect('Legislation, Comment, Request, Creator, IssueCategory')
            ->join('Vote.legislation', 'Legislation')
            ->join('Legislation.issueCategory', 'IssueCategory')
            ->leftJoin('Legislation.request', 'Request')
            ->leftJoin('Request.creator', 'Creator')
            ->leftJoin('Vote.comments', 'Comment')
            ->where($expr->andX(
                $expr->lte('Legislation.displayTime', $expr->literal($now)),
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

    /**
     * {@inheritdoc}
     */
    public function getListQueryBySlugs($govAltTypeSlug, $govSlug, $eoSlug)
    {
        $qb = $this->createQueryBuilder('Vote');
        $expr = $qb->expr();

        $now = (new \DateTime())->format('Y-m-d H:i:s');

        return $qb
            ->addSelect('Legislation, Comment, Request, Creator, IssueCategory')
            ->join('Vote.legislation', 'Legislation')
            ->join('Legislation.issueCategory', 'IssueCategory')
            ->leftJoin('Legislation.request', 'Request')
            ->leftJoin('Request.creator', 'Creator')
            ->leftJoin('Vote.comments', 'Comment')
            ->join('Vote.electedOfficial', 'ElectedOfficial')
            ->join('ElectedOfficial.government', 'Government')
            ->where($expr->andX(
                $expr->lte('Legislation.displayTime', $expr->literal($now)),
                $expr->andX(
                    $expr->eq('Government.altTypeSlug', $expr->literal($govAltTypeSlug)),
                    $expr->eq('Government.slug', $expr->literal($govSlug)),
                    $expr->eq('ElectedOfficial.slug', $expr->literal($eoSlug))
                ),
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
