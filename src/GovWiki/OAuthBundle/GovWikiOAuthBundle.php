<?php

namespace GovWiki\OAuthBundle;

use Symfony\Component\HttpKernel\Bundle\Bundle;

/**
 * Class GovWikiOAuthBundle
 * @package GovWiki\DbBundle
 */
class GovWikiOAuthBundle extends Bundle
{
    /**
     * {@inheritdoc}
     */
    public function getParent()
    {
        return 'FOSOAuthServerBundle';
    }
}
