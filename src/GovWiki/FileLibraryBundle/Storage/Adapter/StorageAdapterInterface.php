<?php

namespace GovWiki\FileLibraryBundle\Storage\Adapter;

use Psr\Http\Message\StreamInterface;

/**
 * Interface StorageAdapterInterface
 *
 * @package GovWiki\FileLibraryBundle\Storage\Adapter
 */
interface StorageAdapterInterface
{

    /**
     * @param string $path Path to created directory.
     *
     * @return void
     *
     * @api
     */
    public function createDirectory(string $path);

    /**
     * @param string          $path    Path where file should be created.
     * @param StreamInterface $content Stored file content.
     *
     * @return void
     *
     * @api
     */
    public function createFile(string $path, StreamInterface $content);

    /**
     * @param string $path Path to checked file.
     *
     * @return boolean
     *
     * @api
     */
    public function isFileExists(string $path): bool;

    /**
     * @param string $path Path to file.
     *
     * @return string
     *
     * @api
     */
    public function generatePublicUrl(string $path): string;

    /**
     * Get list of files for specified path.
     *
     * @param string $path Path to listed directory.
     *
     * @return \Traversable
     * @psalm-return \Traversable<AdapterFile>
     *
     * @api
     */
    public function listFiles(string $path): \Traversable;

    /**
     * @param string $srcPath  Path from which we should move file.
     * @param string $destPath Path to which we should move.
     *
     * @return void
     *
     * @api
     */
    public function move(string $srcPath, string $destPath);

    /**
     * @param string $path A path to removed file.
     *
     * @return void
     *
     * @api
     */
    public function remove(string $path);

    /**
     * @param string $path A path to file.
     *
     * @return StreamInterface
     *
     * @api
     */
    public function read(string $path): StreamInterface;

    /**
     * Check that specified credential is valid for this adapter.
     *
     * @param array $credential Array of credentials.
     *
     * @return boolean
     */
    public static function validateCredentials(array $credential): bool;
}
