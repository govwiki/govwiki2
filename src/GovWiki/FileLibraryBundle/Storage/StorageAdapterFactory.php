<?php

namespace GovWiki\FileLibraryBundle\Storage;

use GovWiki\DbBundle\Entity\ValueObject\EnvironmentFileStorageCredentials;
use GovWiki\FileLibraryBundle\Storage\Adapter\StorageAdapterInterface;

/**
 * Class StorageAdapterFactory
 *
 * @package GovWiki\FileLibraryBundle\Storage
 */
class StorageAdapterFactory
{

    /**
     * @var StorageAdapterInterface[]
     */
    private $adapters = [];

    /**
     * Create storage adapter for specified environment.
     *
     * @param EnvironmentFileStorageCredentials $credentials File storage credentials.
     *
     * @return StorageAdapterInterface
     */
    public function createAdapter(EnvironmentFileStorageCredentials $credentials): StorageAdapterInterface
    {
        $class = $credentials->getAdapter();

        if (! isset($this->adapters[$class])) {
            $this->adapters[$class] = new $class($credentials->getCredentials());
        }

        return $this->adapters[$class];
    }
}
