<?php

namespace GovWiki\DbBundle\Reader;

/**
 * Read data from CSV file.
 * {@link https://www.ietf.org/rfc/rfc4180.txt}
 *
 * @package GovWiki\DbBundle\Reader
 */
class CsvReader implements ReaderInterface
{
    /**
     * @var callable
     */
    private $data;

    /**
     * @param string $filePath Path to reading file.
     */
    public function __construct($filePath)
    {
        $this->data = $this->initGenerator($filePath);
    }

    /**
     * {@inheritdoc}
     */
    public function read()
    {
        $row = $this->data->current();
        $this->data->next();

        return $row;
    }

    /**
     * @param string $filePath Path to reading file.
     *
     * @return \Generator
     */
    private function initGenerator($filePath)
    {
        $fp = fopen($filePath, 'r');
        while(($line = fgets($fp)) !== false) {
            yield explode(';', str_replace(["\n", "\r"], '', $line));
        }
        fclose($fp);
        yield null;
    }
}
