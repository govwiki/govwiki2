<?php

namespace GovWiki\AdminBundle\Util;

/**
 * Class CsvIterator
 * @package GovWiki\AdminBundle\Util
 */
class CsvIterator
{

    /**
     * @var resource
     */
    private $file;

    /**
     * @param string $filename Csv file name.
     */
    public function __construct($filename)
    {
        $this->file = fopen($filename, 'r');
    }

    /**
     * @return \Generator
     */
    public function parse()
    {
        // Get headers.
        $columns = array_map('trim', fgetcsv($this->file, 4096));

        // Process each data row.
        while (! feof($this->file)) {
            $field = array_map('trim', (array) fgetcsv($this->file, 4096));
            if (count($columns) !== count($field)) {
                continue;
            }

            yield array_combine($columns, $field);
        }
    }
}
