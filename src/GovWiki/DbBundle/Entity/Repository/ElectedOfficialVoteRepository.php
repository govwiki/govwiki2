<?php

namespace GovWiki\DbBundle\Entity\Repository;

use Doctrine\ORM\EntityRepository;
use GovWiki\RequestBundle\Entity\AbstractCreateRequest;

/**
 * ElectedOfficialVoteRepository
 */
class ElectedOfficialVoteRepository extends EntityRepository implements ListedEntityRepositoryInterface
{

    /**
     * @param integer $electedOfficial Elected official entity id.
     * @param integer $user            User entity id.
     *
     * @return \Doctrine\ORM\QueryBuilder
     */
    public function getListQuery($electedOfficial, $user = null)
    {
        $expr = $this->_em->getExpressionBuilder();
        $qb = $this->createQueryBuilder('Vote');

        $now = (new \DateTime())->format('Y-m-d H:i:s');

        $qb
            ->addSelect('Legislation, Comment, Request, Creator, IssueCategory')
            ->join('Vote.legislation', 'Legislation')
            ->join('Legislation.issueCategory', 'IssueCategory')
            ->leftJoin('Legislation.request', 'Request')
            ->leftJoin('Request.creator', 'Creator')
            ->leftJoin('Vote.comments', 'Comment')
            ->where($expr->andX(
                $expr->lte('Legislation.displayTime', $expr->literal($now)),
                $expr->eq('Vote.electedOfficial', $electedOfficial)
            ));

        if ($user) {
            $qb->andWhere(
                $expr->orX(
                    $expr->isNull('Legislation.request'),
                    $expr->neq(
                        'Request.status',
                        $expr->literal(AbstractCreateRequest::STATE_DISCARDED)
                    )
                )
            );
        } else {
            $qb->andWhere(
                $expr->orX(
                    $expr->isNull('Legislation.request'),
                    $expr->eq(
                        'Request.status',
                        $expr->literal(AbstractCreateRequest::STATE_APPLIED)
                    )
                )
            );
        }

        return $qb;
    }

    /**
     * {@inheritdoc}
     */
    public function getListQueryBySlugs($govAltTypeSlug, $govSlug, $eoSlug, $user = null)
    {
        $qb = $this->createQueryBuilder('Vote');
        $expr = $qb->expr();

        $now = (new \DateTime())->format('Y-m-d H:i:s');

        $qb
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
                )
            ));

        if ($user) {
            $qb->andWhere(
                $expr->orX(
                    $expr->isNull('Legislation.request'),
                    $expr->neq(
                        'Request.status',
                        $expr->literal(AbstractCreateRequest::STATE_DISCARDED)
                    )
                )
            );
        } else {
            $qb->andWhere(
                $expr->orX(
                    $expr->isNull('Legislation.request'),
                    $expr->eq(
                        'Request.status',
                        $expr->literal(AbstractCreateRequest::STATE_APPLIED)
                    )
                )
            );
        }

        return $qb;
    }
}
