<?php

namespace GovWiki\FileLibraryBundle\Storage;

use GovWiki\DbBundle\Entity\Environment;
use GovWiki\FileLibraryBundle\Entity\Document;
use GovWiki\FileLibraryBundle\Storage\Adapter\StorageAdapterInterface;
use GovWiki\FileLibraryBundle\Storage\Index\StorageIndexInterface;
use Psr\Http\Message\StreamInterface;

/**
 * Class File
 *
 * @package GovWiki\FileLibraryBundle\Storage
 */
class File extends AbstractFile
{

    /**
     * @var integer
     */
    private $size;

    /**
     * @var StreamInterface|null
     */
    private $content;

    /**
     * @var string|null
     */
    private $url;

    /**
     * AbstractFile constructor.
     *
     * @param Environment             $environment A Environment instance.
     * @param StorageAdapterInterface $adapter A StorageAdapterInterface instance.
     * @param StorageIndexInterface   $index   A StorageIndexInterface instance.
     * @param string                  $path    Path to file.
     * @param integer                 $size    Size of file.
     * @param StreamInterface         $content File content.
     */
    public function __construct(
        Environment $environment,
        StorageAdapterInterface $adapter,
        StorageIndexInterface $index,
        string $path,
        int $size,
        StreamInterface $content = null
    ) {
        parent::__construct($environment, $adapter, $index, $path);
        $this->size = $size;
        $this->content = $content;
    }

    /**
     * Get size of file in bytes.
     *
     * @return integer
     */
    public function getSize(): int
    {
        return $this->size;
    }

    /**
     * Get file content.
     *
     * @return StreamInterface
     */
    public function getContent(): StreamInterface
    {
        if ($this->content === null) {
            $this->content = $this->adapter->read($this->path);
        }

        return $this->content;
    }

    /**
     * @return string
     */
    public function getDownloadUrl(): string
    {
        if ($this->url === null) {
            $this->url = $this->adapter->generatePublicUrl($this->path);
        }

        return $this->url;
    }
}
