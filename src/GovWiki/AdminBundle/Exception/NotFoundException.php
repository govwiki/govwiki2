<?php

namespace GovWiki\AdminBundle\Exception;

/**
 * Class NotFoundException
 * @package GovWiki\AdminBundle\Exception
 */
class NotFoundException extends FileTransformerException
{
    /**
     * @param string $alias Transformer alias.
     */
    public function __construct($alias)
    {
        parent::__construct("Can't find transformer with alias $alias");
    }
}
