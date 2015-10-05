<?php

namespace GovWiki\UserBundle;

use Symfony\Component\HttpKernel\Bundle\Bundle;

class GovWikiUserBundle extends Bundle
{
    public function getParent()
    {
        return 'FOSUserBundle';
    }
}
