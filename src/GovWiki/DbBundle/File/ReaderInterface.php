<?php

namespace GovWiki\DbBundle\File;

use GovWiki\DbBundle\Exception\EmptyFileException;

/**
 * Interface ReaderInterface
 * @package GovWiki\DbBundle\File
 */
interface ReaderInterface
{
    /**
     * Return read data assoc array.
     *
     * @return \Generator|\Iterator
     *
     * @throws EmptyFileException Try to read from empty source.
     * @throws \RuntimeException For explanation see concrete reader
     * implementation.
     */
    public function read();
}
