<?php

namespace GovWiki\FileLibraryBundle\Storage;

use GovWiki\DbBundle\Entity\Environment;
use GovWiki\FileLibraryBundle\Storage\Index\StorageIndexInterface;

/**
 * Class StorageAdapterFactory
 *
 * @package GovWiki\FileLibraryBundle\Storage
 */
class StorageFactory
{

    /**
     * @var StorageAdapterFactory
     */
    private $factory;

    /**
     * @var StorageIndexInterface
     */
    private $index;

    /**
     * @var Storage[]
     */
    private $storages = [];

    /**
     * StorageFactory constructor.
     *
     * @param StorageAdapterFactory $factory A StorageAdapterFactory instance.
     * @param StorageIndexInterface $index   A StorageIndexInterface instance.
     */
    public function __construct(
        StorageAdapterFactory $factory,
        StorageIndexInterface $index
    ) {
        $this->factory = $factory;
        $this->index = $index;
    }

    /**
     * Create storage adapter for specified environment.
     *
     * @param Environment $environment Required environment.
     *
     * @return Storage
     */
    public function createStorage(Environment $environment): Storage
    {
        if (! isset($this->storages[$environment->getId()])) {
            $credentials = $environment->getLibraryCredentials();

            if ($credentials === null) {
                throw new \LogicException(\sprintf(
                    'Environment "%s" don\'t has configured file storage credentials',
                    $environment->getName()
                ));
            }

            $this->storages[$environment->getId()] = new Storage(
                $environment,
                $this->factory->createAdapter($credentials),
                $this->index
            );
        }

        return $this->storages[$environment->getId()];
    }
}
