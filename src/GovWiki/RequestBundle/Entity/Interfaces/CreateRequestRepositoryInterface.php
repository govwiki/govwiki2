<?php

namespace GovWiki\RequestBundle\Entity\Interfaces;

/**
 * Interface CreateRequestRepositoryInterface
 * @package GovWiki\RequestBundle\Entity\Interfaces
 */
interface CreateRequestRepositoryInterface
{
    /**
     * @param string $alias Alias for root entity.
     *
     * @return \Doctrine\ORM\QueryBuilder
     */
    public function getQueryBuilder($alias);
}
