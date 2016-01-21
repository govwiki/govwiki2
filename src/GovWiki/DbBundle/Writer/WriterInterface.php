<?php

namespace GovWiki\DbBundle\Writer;

/**
 * Interface WriterInterface
 * @package GovWiki\DbBundle\Writer
 */
interface WriterInterface
{
    /**
     * @param array $row One line of data.
     *
     * @return void
     */
    public function write(array $row);
}
