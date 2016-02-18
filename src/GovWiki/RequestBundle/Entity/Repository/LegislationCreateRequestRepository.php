<?php

namespace GovWiki\RequestBundle\Entity\Repository;

use Doctrine\ORM\EntityRepository;
use GovWiki\RequestBundle\Entity\Interfaces\CreateRequestRepositoryInterface;

/**
 * LegislationCreateRequestRepository
 */
class LegislationCreateRequestRepository extends EntityRepository implements CreateRequestRepositoryInterface
{
    /**
     * {@inheritdoc}
     */
    public function getQueryBuilder($alias)
    {
        return $this->createQueryBuilder($alias)
            ->addSelect(
                'Legislation, Vote, ElectedOfficial',
                'Government, IssueCategory'
            )
            ->join($alias.'.subject', 'Legislation')
            ->join('Legislation.government', 'Government')
            ->join('Legislation.electedOfficialVotes', 'Vote')
            ->join('Legislation.issueCategory', 'IssueCategory')
            ->join('Vote.electedOfficial', 'ElectedOfficial');
    }
}
