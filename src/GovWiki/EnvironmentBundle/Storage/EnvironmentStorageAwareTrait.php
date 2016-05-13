<?php

namespace GovWiki\EnvironmentBundle\Storage;

/**
 * Class EnvironmentStorageAwareTrait
 * @package GovWiki\EnvironmentBundle\Storage
 */
trait EnvironmentStorageAwareTrait
{

    /**
     * @var EnvironmentStorageInterface
     */
    private $environmentStorage;

    /**
     * Inject environment storage interface.
     *
     * @param EnvironmentStorageInterface $storage A EnvironmentStorageInterface
     *                                             instance.
     *
     * @return void
     */
    public function setEnvironmentStorage(EnvironmentStorageInterface $storage)
    {
        $this->environmentStorage = $storage;
    }
}
