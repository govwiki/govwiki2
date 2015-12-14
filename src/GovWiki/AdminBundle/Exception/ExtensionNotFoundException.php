<?php

namespace GovWiki\AdminBundle\Exception;

/**
 * Class ExtensionNotFoundException
 * @package GovWiki\AdminBundle\Exception
 */
class ExtensionNotFoundException extends FileTransformerException
{
    /**
     * @param string $extension Seeking file extension.
     * @param array  $supported Supported file extensions.
     */
    public function __construct($extension, array $supported)
    {
        parent::__construct(
            "Can't found $extension among registered file extensions. Expect ".
            implode(', ', $supported)
        );
    }
}
