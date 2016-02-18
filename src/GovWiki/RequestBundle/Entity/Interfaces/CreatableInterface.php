<?php

namespace GovWiki\RequestBundle\Entity\Interfaces;

use Doctrine\ORM\QueryBuilder;
use GovWiki\RequestBundle\Entity\AbstractCreateRequest;

/**
 * Interface CreatableInterface
 * @package GovWiki\RequestBundle\Entity\Interfaces
 */
interface CreatableInterface
{
    /**
     * @param AbstractCreateRequest $request A AbstractCreateRequest instance.
     *
     * @return CreatableInterface
     */
    public function setRequest(AbstractCreateRequest $request);

    /**
     * @return AbstractCreateRequest
     */
    public function getRequest();
}
