<?php

namespace GovWiki\DbBundle\Exception;

/**
 * Class UnknownKeyException
 * @package GovWiki\DbBundle\Exception
 */
class UnknownKeyException extends GovWikiDbBundleException
{
    /**
     * @param string $key Key taken from user.
     */
    public function __construct($key)
    {
        parent::__construct("Can't find key '{$key}''");
    }
}
