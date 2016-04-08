<?php

namespace GovWiki\MobileDetectBundle\EventListener;

use SunCat\MobileDetectBundle\EventListener\RequestResponseListener as BaseListener;
use Symfony\Component\HttpFoundation\Request;
use GovWiki\MobileDetectBundle\Utils\Functions;

/**
 * Class GovWikiRequestResponseListener
 * @package GovWiki\MobileDetectBundle\EventListener
 */
class GovWikiRequestResponseListener extends BaseListener
{

    /**
     * Gets the redirect url.
     *
     * @param Request $request
     * @param string $platform
     *
     * @return string
     */
    protected function getRedirectUrl(Request $request, $platform)
    {
        // Change platform host.
        $host = $request->getHost();
        $host = $request->getScheme() .'://'. Functions::sanitizeHost($platform, $host);

        $this->redirectConf[$platform]['host'] = $host;

        return parent::getRedirectUrl($request, $platform);
    }
}
