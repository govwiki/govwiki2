<?php

namespace GovWiki\EnvironmentBundle\Storage;

/**
 * Interface EnvironmentStorageAwareInterface
 * @package GovWiki\EnvironmentBundle\Storage
 */
interface EnvironmentStorageAwareInterface
{

    /**
     * Inject environment storage interface.
     *
     * @param EnvironmentStorageInterface $storage A EnvironmentStorageInterface
     *                                             instance.
     *
     * @return void
     */
    public function setEnvironmentStorage(EnvironmentStorageInterface $storage);
}
