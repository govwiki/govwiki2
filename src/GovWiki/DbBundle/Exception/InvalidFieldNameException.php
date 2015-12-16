<?php

namespace GovWiki\DbBundle\Exception;

/**
 * Class InvalidFieldNameException
 * @package GovWiki\DbBundle\Exception
 */
class InvalidFieldNameException extends GovWikiDbBundleException
{
    /**
     * @param string $field  Not founded field name.
     * @param string $entity Entity name.
     */
    public function __construct($field, $entity)
    {
        parent::__construct("Can't find field '$field' in entity $entity.");
    }
}
