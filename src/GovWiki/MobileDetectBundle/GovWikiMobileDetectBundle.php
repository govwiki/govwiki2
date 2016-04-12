<?php

namespace GovWiki\MobileDetectBundle;

use Symfony\Component\HttpKernel\Bundle\Bundle;

/**
 * Class MobileDetectBundle
 * @package GovWiki\MobileDetectBundle
 */
class GovWikiMobileDetectBundle extends Bundle
{

    /**
     * {@inheritdoc}
     */
    public function getParent()
    {
        return 'MobileDetectBundle';
    }
}
