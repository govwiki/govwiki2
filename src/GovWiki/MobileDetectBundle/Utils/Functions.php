<?php

namespace GovWiki\MobileDetectBundle\Utils;

use GovWiki\MobileDetectBundle\EventListener\GovWikiRequestResponseListener;

/**
 * Class Functions
 * @package GovWiki\MobileDetectBundle\Utils
 */
final class Functions
{
    /**
     * Remove or add 'm.' prefix to host name.
     *
     * @param string $platform Maybe 'mobile', 'full' or 'tablet'.
     * @param string $host     Host name.
     *
     * @return string
     */
    public static function sanitizeHost($platform, $host)
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
                $host = 'm.'. $host;
                break;
        }

        return $host;
    }
}
