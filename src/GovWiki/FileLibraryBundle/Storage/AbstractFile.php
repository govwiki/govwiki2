<?php

namespace GovWiki\FileLibraryBundle\Storage;

use GovWiki\DbBundle\Entity\Environment;
use GovWiki\FileLibraryBundle\Storage\Adapter\StorageAdapterInterface;
use GovWiki\FileLibraryBundle\Storage\Index\StorageIndexInterface;

/**
 * Class AbstractFile
 *
 * @package GovWiki\FileLibraryBundle\Storage
 */
abstract class AbstractFile
{

    /**
     * @var Environment
     */
    protected $environment;

    /**
     * @var StorageAdapterInterface
     */
    protected $adapter;

    /**
     * @var StorageIndexInterface
     */
    protected $index;

    /**
     * @var string
     */
    protected $path;

    /**
     * AbstractFile constructor.
     *
     * @param Environment             $environment A Environment instance.
     * @param StorageAdapterInterface $adapter     A StorageAdapterInterface instance.
     * @param StorageIndexInterface   $index       A StorageIndexInterface instance.
     * @param string                  $path        Path to file.
     */
    public function __construct(
        Environment $environment,
        StorageAdapterInterface $adapter,
        StorageIndexInterface $index,
        string $path
    ) {
        $this->environment = $environment;
        $this->adapter = $adapter;
        $this->index = $index;
        $this->path = $path;
    }

    /**
     * Get directory name.
     *
     * @return string
     */
    public function getName(): string
    {
        return \basename($this->path);
    }

    /**
     * Get path to this directory.
     *
     * @return string
     */
    public function getPath(): string
    {
        return $this->path;
    }

    /**
     * @return void
     */
    public function remove()
    {
        $this->adapter->remove($this->path);
        $this->index->remove($this->environment, $this->path)->flush();
    }

    /**
     * @param string $path Destination path.
     *
     * @return $this
     */
    public function move(string $path)
    {
        $this->adapter->move($this->path, $path);
        $this->index->move($this->environment, $this->path, $path)->flush();

        return $this;
    }
}
