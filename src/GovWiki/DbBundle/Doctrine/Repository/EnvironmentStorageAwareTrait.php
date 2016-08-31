<?php

namespace GovWiki\DbBundle\Doctrine\Repository;

use GovWiki\EnvironmentBundle\Storage\EnvironmentStorageInterface;

/**
 * Trait EnvironmentStorageAwareTrait
 * @package GovWiki\DbBundle\Doctrine\Repository
 */
trait EnvironmentStorageAwareTrait
{

    /**
     * @var EnvironmentStorageInterface
     */
    private $storage;

    /**
     * @param EnvironmentStorageInterface $storage A EnvironmentStorageInterface
     *                                             instance.
     *
     * @return void
     */
    public function setEnvironmentStorage(EnvironmentStorageInterface $storage)
    {
        $this->storage = $storage;
    }
}
