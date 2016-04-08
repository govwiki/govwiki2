<?php

namespace GovWiki\MobileDetectBundle\EventListener;

use SunCat\MobileDetectBundle\EventListener\RequestResponseListener as BaseListener;
use Symfony\Component\HttpFoundation\Request;

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
        $host = self::sanitizeHost($platform, $request->getHost());
        $host = $request->getScheme() .'://'. $host;

        $this->redirectConf[$platform]['host'] = $host;

        return parent::getRedirectUrl($request, $platform);
    }

    /**
     * Remove or add 'm.' prefix to host name.
     *
     * @param string $platform Maybe 'mobile', 'full' or 'tablet'.
     * @param string $host     Host name.
     *
     * @return string
     */
    protected static function sanitizeHost($platform, $host)
    {
        switch ($platform) {
            // Desktop.
            case GovWikiRequestResponseListener::FULL:
                if (strpos($host, 'm.') !== false) {
                    $host = substr($host, 2);
                }
                break;

            // Mobile.
            case GovWikiRequestResponseListener::MOBILE:
                if (strpos($host, 'm.') === false) {
                    $host = 'm.' . $host;
                }
                break;
        }

        return $host;
    }
}
