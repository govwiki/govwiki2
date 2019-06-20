<?php

namespace GovWiki\DbBundle\Entity\ValueObject;

use GovWiki\FileLibraryBundle\Storage\Adapter\StorageAdapterInterface;

/**
 * Class EnvironmentFileStorageCredentials
 *
 * @package GovWiki\DbBundle\Entity\ValueObject
 */
class EnvironmentFileStorageCredentials
{

    /**
     * @var string
     */
    private $adapter;

    /**
     * @var array
     */
    private $credentials;

    /**
     * EnvironmentFileStorageCredentials constructor.
     *
     * @param string $adapter     Adapter class.
     * @param array  $credentials Adapter specific credentials.
     */
    public function __construct(string $adapter, array $credentials)
    {
        if (! \in_array(StorageAdapterInterface::class, \class_implements($adapter), true)) {
            throw new \LogicException(\sprintf('Unknown adapter "%s"', $adapter));
        }

        if (! $adapter::validateCredentials($credentials)) {
//            throw new \LogicException(\sprintf('Invalid credentials for "%s" adapter', $adapter));
        }

        $this->adapter = $adapter;
        $this->credentials = $credentials;
    }

    /**
     * @return string
     */
    public function getAdapter(): string
    {
        return $this->adapter;
    }

    /**
     * @return array
     */
    public function getCredentials(): array
    {
        return $this->credentials;
    }
}
