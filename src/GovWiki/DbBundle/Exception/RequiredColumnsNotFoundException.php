<?php

namespace GovWiki\DbBundle\Exception;

/**
 * Class RequiredColumnsNotFoundException
 * @package GovWiki\DbBundle\Exception
 */
class RequiredColumnsNotFoundException extends GovWikiDbBundleException
{
    /**
     * @param array $notFounded List of not founded columns.
     * @param array $required   List of required columns.
     * @param array $currents   List of current columns.
     */
    public function __construct($notFounded, $required, $currents)
    {
        parent::__construct(
            'Can\'t find required columns: '. implode(', ', $notFounded) .
            '. Expect: '. implode(',', $required) .' but given '.
            implode(',', $currents)
        );
    }
}
