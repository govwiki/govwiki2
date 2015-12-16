<?php

namespace GovWiki\ApiBundle\Exception;

/**
 * Class GovWikiApiEnvironmentNotFoundException
 * @package GovWiki\ApiBundle\Exception
 */
class GovWikiApiEnvironmentNotFoundException extends GovWikiApiException
{
    /**
     * @param string $domain Domain name.
     */
    public function __construct($domain)
    {
        parent::__construct("Can't find environment for domain $domain");
    }
}
