<?php

namespace GovWiki\FileLibraryBundle\Storage;

use GovWiki\DbBundle\Entity\Environment;
use GovWiki\FileLibraryBundle\Storage\Adapter\StorageAdapterInterface;
use GovWiki\FileLibraryBundle\Storage\Index\StorageIndexInterface;
use Psr\Http\Message\StreamInterface;

/**
 * Class Storage
 *
 * @package GovWiki\FileLibraryBundle\Storage
 */
class Storage
{

    /**
     * @var Environment
     */
    private $environment;

    /**
     * @var StorageAdapterInterface
     */
    private $adapter;

    /**
     * @var StorageIndexInterface
     */
    private $index;

    /**
     * Storage constructor.
     *
     * @param Environment             $environment Required environment.
     * @param StorageAdapterInterface $adapter     A StorageAdapterInterface instance.
     * @param StorageIndexInterface   $index       A StorageIndexInterface instance.
     */
    public function __construct(
        Environment $environment,
        StorageAdapterInterface $adapter,
        StorageIndexInterface $index
    ) {
        $this->environment = $environment;
        $this->adapter = $adapter;
        $this->index = $index;
    }

    /**
     * Create new directory in storage.
     *
     * Create all specified parent directories if they not exists.
     *
     * @param string $path Path where directory should be placed.
     *
     * @return Directory
     *
     * @api
     */
    public function createDirectory(string $path): Directory
    {
        $this->adapter->createDirectory($path);
        $this->index->createDirectory($this->environment, $path)->flush();

        return new Directory(
            $this->environment,
            $this->adapter,
            $this->index,
            $path
        );
    }

    /**
     * @param string $path Path to required directory.
     *
     * @return Directory|null
     */
    public function getDirectory(string $path)
    {
        if ($path !== '/') {
            //
            // Ignore root directory 'cause we don't index it.
            //
            $directory = $this->index->getDirectory($this->environment, $path);
            if ($directory === null) {
                return null;
            }
        }

        return new Directory(
            $this->environment,
            $this->adapter,
            $this->index,
            $path
        );
    }

    /**
     * Create new file in storage.
     *
     * Create all specified parent directories if they not exists.
     *
     * @param string          $path   Path where file should be placed.
     * @param StreamInterface $stream File content.
     *
     * @return File
     * @api
     */
    public function createFile(string $path, StreamInterface $stream): File
    {
        $this->adapter->createFile($path, $stream);
        $this->index->createFile($this->environment, $path, $stream->getSize())->flush();

        return new File(
            $this->environment,
            $this->adapter,
            $this->index,
            $path,
            $stream->getSize(),
            $stream
        );
    }

    /**
     * @param string $path Path to required file.
     *
     * @return File|null
     */
    public function getFile(string $path)
    {
        $file = $this->index->getFile($this->environment, $path);
        if ($file === null) {
            return null;
        }

        return new File(
            $this->environment,
            $this->adapter,
            $this->index,
            $path,
            $file->getFileSize()
        );
    }

    /**
     * @param string $path Path to removed file.
     *
     * @return void
     */
    public function remove(string $path)
    {
        $this->adapter->remove($path);
        $this->index->remove($this->environment, $path)->flush();
    }

    /**
     * @param string $path Path to checked file.
     *
     * @return boolean
     */
    public function isFileExists(string $path): bool
    {
        return $this->adapter->isFileExists($path);
    }

    /**
     * @param string $path Path to file.
     *
     * @return string
     */
    public function generatePublicUrl(string $path): string
    {
        return $this->adapter->generatePublicUrl($path);
    }

    /**
     * @return StorageIndexInterface
     */
    public function getIndex(): StorageIndexInterface
    {
        return $this->index;
    }

    /**
     * @return StorageAdapterInterface
     */
    public function getAdapter(): StorageAdapterInterface
    {
        return $this->adapter;
    }
}
