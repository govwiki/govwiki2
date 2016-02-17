<?php

namespace GovWiki\RequestBundle\Entity\Repository;

use Doctrine\ORM\EntityRepository;
use GovWiki\RequestBundle\Entity\Interfaces\CreateRequestRepositoryInterface;

/**
 * ContributionCreateRequestRepository
 */
class ContributionCreateRequestRepository extends EntityRepository implements CreateRequestRepositoryInterface
{
    /**
     * {@inheritdoc}
     */
    public function getQueryBuilder($alias)
    {
        return $this->createQueryBuilder($alias)
            ->addSelect('Contribution, ElectedOfficial')
            ->join($alias.'.subject', 'Contribution')
            ->join('Contribution.electedOfficial', 'ElectedOfficial');
    }
}
