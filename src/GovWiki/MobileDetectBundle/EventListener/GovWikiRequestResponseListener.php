<?php

namespace GovWiki\MobileDetectBundle\EventListener;

use SunCat\MobileDetectBundle\EventListener\RequestResponseListener as BaseListener;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Event\GetResponseEvent;
use Symfony\Component\HttpKernel\HttpKernelInterface;

/**
 * Class GovWikiRequestResponseListener
 * @package GovWiki\MobileDetectBundle\EventListener
 */
class GovWikiRequestResponseListener extends BaseListener
{

    public function handleRequest(GetResponseEvent $event)
    {
        // only handle master request, do not handle sub request like esi includes
        // If the device view is "not the mobile view" (e.g. we're not in the request context)
        if ($event->getRequestType() !== HttpKernelInterface::MASTER_REQUEST || $this->deviceView->isNotMobileView()) {
            return;
        }

        $request = $event->getRequest();
        $this->mobileDetector->setUserAgent($request->headers->get('user-agent'));

        // Sets the flag for the response handled by the GET switch param and the type of the view.
        if ($this->deviceView->hasSwitchParam()) {
            $event->setResponse($this->getRedirectResponseBySwitchParam($request));
            return;
        }

        if ($this->redirectConf['detect_tablet_as_mobile'] === false && $this->mobileDetector->isTablet()) {
            $this->deviceView->setTabletView();
        } elseif ($this->mobileDetector->isMobile()) {
            $this->deviceView->setMobileView();
        } else {
            $this->deviceView->setFullView();
        }

        // Check if we must redirect to the target view and do so if needed
        if ($this->mustRedirect($request, $this->deviceView->getViewType())) {
            if (($response = $this->getRedirectResponse($request, $this->deviceView->getViewType()))) {
                $event->setResponse($response);
            }
            return;
        }
    }

    /**
     * Do we have to redirect?
     *
     * @param Request $request
     * @param string $view For which view should be check?
     *
     * @return boolean
     */
    protected function mustRedirect(Request $request, $view)
    {
        if (
            !isset($this->redirectConf[$view]) ||
            !$this->redirectConf[$view]['is_enabled'] ||
            ($this->getRoutingOption($request->get('_route'), $view) === self::NO_REDIRECT)
        ) {
            return false;
        }

        return true;
    }

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
     * {@inheritdoc}
     */
    protected function getRedirectResponse(Request $request, $view)
    {
        if (($host = $this->getRedirectUrl($request, $view))) {
            return new RedirectResponse($host, $this->redirectConf[$view]['status_code']);
        }

        return null;
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
