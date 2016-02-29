<?php

namespace GovWiki\DbBundle\File;

/**
 * Write data to CSV file.
 * {@link https://www.ietf.org/rfc/rfc4180.txt}
 *
 * @package GovWiki\DbBundle\File
 */
class CsvFile implements WriterInterface
{

    /**
     * @var resource
     */
    private $handle;

    /**
     * @var boolean
     */
    private $isCaptionWrote = false;

    /**
     * @param string $filePath Path to new file.
     */
    public function __construct($filePath)
    {
        $this->handle = fopen($filePath, 'w');
    }

    /**
     *
     */
    public function __destruct()
    {
        fclose($this->handle);
    }

    /**
     * {@inheritdoc}
     */
    public function write(array $row)
    {
        if (! $this->isCaptionWrote) {
            /*
             * Add caption line to csv file. (rfc4180.2.3)
             */
            fwrite($this->handle, implode(',', array_keys($row)) ."\n");
            $this->isCaptionWrote = true;
        }
        fwrite($this->handle, implode(',', $row) ."\n");
    }
}
