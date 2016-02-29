<?php

namespace GovWiki\DbBundle\File;

use GovWiki\DbBundle\Exception\EmptyFileException;

/**
 * Read data from CSV file.
 * {@link https://www.ietf.org/rfc/rfc4180.txt}
 *
 * @package GovWiki\DbBundle\File
 */
class CsvReader implements ReaderInterface
{
    /**
     * @var string
     */
    private $filePath;

    /**
     * @param string $filePath Path to reading file.
     */
    public function __construct($filePath)
    {
        $this->filePath = $filePath;
    }

    /**
     * {@inheritdoc}
     */
    public function read()
    {
        $file = fopen($this->filePath, 'r');

        /*
         * Assume what first line if list of columns names.
         */
        $line = fgets($file);
        if (false === $line) {
            /*
             * Empty file, throw error.
             */
            throw new EmptyFileException($this->filePath);
        }

        /*
         * Find out separator, because not everyone reads specifications.
         */
        preg_match('/([^\w"\'])/', $line, $matched);
        if (is_array($matched) && (count($matched) > 0)) {
            $separator = $matched[0];
        } else {
            throw new \RuntimeException('Can\'t get ');
        }
        $columns = str_getcsv($line, $separator);

        while (($line = fgets($file)) !== false) {
            $row = str_getcsv($line, $separator);
            $row = array_combine($columns, $row);
            yield $row;
        }
        fclose($file);
    }
}
