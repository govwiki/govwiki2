<?php

namespace GovWiki\FileLibraryBundle\Storage\Index;

use GovWiki\DbBundle\Entity\Environment;
use GovWiki\FileLibraryBundle\Entity\Directory;
use GovWiki\FileLibraryBundle\Entity\Document;
use GovWiki\FileLibraryBundle\Storage\FileListBuilderInterface;

/**
 * Interface StorageIndexInterface
 *
 * @package GovWiki\FileLibraryBundle\Storage\Index
 */
interface StorageIndexInterface
{

    /**
     * @param Environment $environment Required environment.
     * @param string      $path        Path to created directory.
     *
     * @return $this
     *
     * @api
     */
    public function createDirectory(Environment $environment, string $path);

    /**
     * @param Environment $environment Required environment.
     * @param string      $path        Path to required directory.
     *
     * @return Directory|null
     */
    public function getDirectory(Environment $environment, string $path);

    /**
     * @param Environment $environment Required environment.
     * @param string      $path        Path where file should be created.
     * @param integer     $size        Stored file size.
     *
     * @return $this
     *
     * @api
     */
    public function createFile(Environment $environment, string $path, int $size);

    /**
     * @param Environment $environment Required environment.
     * @param string      $path        Path to required file.
     *
     * @return Document|null
     */
    public function getFile(Environment $environment, string $path);

    /**
     *
     * @param Environment $environment Required environment.
     * @param string|null $path        Path to directory.
     *
     * @return FileListBuilderInterface
     */
    public function createFileListBuilder(Environment $environment, string $path = null): FileListBuilderInterface;

    /**
     * @param Environment $environment Required environment.
     * @param string      $srcPath     Path from which we should move file.
     * @param string      $destPath    Path to which we should move.
     *
     * @return $this
     *
     * @api
     */
    public function move(Environment $environment, string $srcPath, string $destPath);

    /**
     * @param Environment $environment Required environment.
     * @param string      $path        A path to removed file.
     *
     * @return $this
     *
     * @api
     */
    public function remove(Environment $environment, string $path);

    /**
     * Clear whole index.
     *
     * @param Environment $environment Required environment.
     *
     * @return $this
     */
    public function clearIndex(Environment $environment);

    /**
     * Flush changes.
     *
     * @return $this
     */
    public function flush();
}
