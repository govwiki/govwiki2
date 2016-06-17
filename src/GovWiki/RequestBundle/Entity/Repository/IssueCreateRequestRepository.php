<?php

namespace GovWiki\RequestBundle\Entity\Repository;

use Doctrine\ORM\EntityRepository;
use GovWiki\RequestBundle\Entity\Interfaces\CreateRequestRepositoryInterface;

/**
 * IssueCreateRequestRepository
 */
class IssueCreateRequestRepository extends EntityRepository implements CreateRequestRepositoryInterface
{
    /**
     * {@inheritdoc}
     */
    public function getQueryBuilder($alias)
    {
        return $this->createQueryBuilder($alias);
    }
}
