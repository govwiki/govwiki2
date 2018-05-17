<?php

namespace GovWiki\FileLibraryBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use GovWiki\DbBundle\Entity\Environment;

/**
 * Class Document
 *
 * @ORM\Entity
 *
 * @package GovWiki\FileLibraryBundle\Entity
 */
class Document extends AbstractFile
{

    /**
     * Document file extension.
     *
     * @var string
     *
     * @ORM\Column
     */
    public $ext;

    /**
     * AbstractFile constructor.
     *
     * @param Environment $environment Required environment.
     * @param string      $name        A filename without extension.
     * @param string      $ext         A file extension.
     * @param string      $publicPath  A public path to file.
     * @param string      $slug        A filename slug.
     * @param integer     $fileSize    A file size.
     * @param Directory   $parent      A parent directory.
     */
    public function __construct(
        Environment $environment,
        string $name,
        string $ext,
        string $publicPath,
        string $slug,
        int $fileSize,
        Directory $parent = null
    ) {
        parent::__construct($environment, $name, $publicPath, $slug, $fileSize, $parent);

        $this->ext = $ext;
    }

    /**
     * @return string
     */
    public function getExt(): string
    {
        return $this->ext;
    }

    /**
     * @param string $ext A file extension.
     *
     * @return $this
     */
    public function setExt(string $ext)
    {
        $this->ext = $ext;

        return $this;
    }

    /**
     * @return boolean
     */
    public function isDirectory(): bool
    {
        return false;
    }

    /**
     * @return boolean
     */
    public function isDocument(): bool
    {
        return true;
    }
}
