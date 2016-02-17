<?php

namespace GovWiki\RequestBundle\Entity\Repository;

use Doctrine\ORM\EntityRepository;
use GovWiki\RequestBundle\Entity\Interfaces\CreateRequestRepositoryInterface;

/**
 * EndorsementCreateRequestRepository
 */
class EndorsementCreateRequestRepository extends EntityRepository implements CreateRequestRepositoryInterface
{
    /**
     * {@inheritdoc}
     */
    public function getQueryBuilder($alias)
    {
        return $this->createQueryBuilder($alias)
            ->addSelect('Endorsement, ElectedOfficial')
            ->join($alias.'.subject', 'Endorsement')
            ->join('Endorsement.electedOfficial', 'ElectedOfficial');
    }
}
