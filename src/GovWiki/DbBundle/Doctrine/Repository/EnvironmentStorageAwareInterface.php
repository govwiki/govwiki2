<?php

namespace GovWiki\DbBundle\Doctrine\Repository;

use GovWiki\EnvironmentBundle\Storage\EnvironmentStorageInterface;

/**
 * Interface EnvironmentStorageAwareInterface
 * @package GovWiki\DbBundle\Doctrine\Repository
 */
interface EnvironmentStorageAwareInterface
{

    /**
     * @param EnvironmentStorageInterface $storage A EnvironmentStorageInterface
     *                                             instance.
     *
     * @return void
     */
    public function setEnvironmentStorage(EnvironmentStorageInterface $storage);
}
