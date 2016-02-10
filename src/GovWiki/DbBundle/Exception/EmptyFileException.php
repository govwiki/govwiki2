<?php

namespace GovWiki\DbBundle\Exception;

/**
 * Class EmptyFileException
 * @package GovWiki\DbBundle\Exception
 */
class EmptyFileException extends GovWikiDbBundleException
{
    /**
     * @param string $file Path to file.
     */
    public function __construct($file)
    {
        parent::__construct("'${file}' is empty.");
    }
}
