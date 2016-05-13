<?php

namespace GovWiki\UserBundle;

use Symfony\Component\HttpKernel\Bundle\Bundle;

/**
 * Class GovWikiUserBundle
 * @package GovWiki\UserBundle
 */
class GovWikiUserBundle extends Bundle
{

    /**
     * {@inheritdoc}
     */
    public function getParent()
    {
        return 'FOSUserBundle';
    }
}
