<?php

namespace GovWiki\AdminBundle\Transformer;

use GovWiki\AdminBundle\Exception\FileTransformerException;

/**
 * Transform data from file to array and back.
 * Tag symfony service with 'transformer'.
 *
 * @package GovWiki\Library\Transformer
 */
interface FileTransformerInterface
{
    /**
     * @param string $filePath Path to file.
     *
     * @return array
     *
     * @throws FileTransformerException If some error occurred.
     */
    public function transform($filePath);

    /**
     * @param string $filePath Path to file.
     * @param array  $data     Data to transform.
     *
     * @return void
     *
     * @throws FileTransformerException If some error occurred.
     */
    public function reverseTransform($filePath, array $data);

    /**
     * Array of supported file extensions for transform.
     *
     * @return array
     */
    public static function supportedExtensions();

    /**
     * Return format name.
     *
     * @return string
     */
    public static function getFormatName();
}
