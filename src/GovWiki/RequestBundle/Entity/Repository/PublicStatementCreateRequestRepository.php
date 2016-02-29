<?php

namespace GovWiki\RequestBundle\Entity\Repository;

use Doctrine\ORM\EntityRepository;
use GovWiki\RequestBundle\Entity\Interfaces\CreateRequestRepositoryInterface;

/**
 * PublicStatementCreateRequestRepository
 */
class PublicStatementCreateRequestRepository extends EntityRepository implements CreateRequestRepositoryInterface
{
    /**
     * {@inheritdoc}
     */
    public function getQueryBuilder($alias)
    {
        return $this->createQueryBuilder($alias)
            ->addSelect('PublicStatement, IssueCategory, ElectedOfficial')
            ->join($alias.'.subject', 'PublicStatement')
            ->join('PublicStatement.issueCategory', 'IssueCategory')
            ->join('PublicStatement.electedOfficial', 'ElectedOfficial');
    }
}
