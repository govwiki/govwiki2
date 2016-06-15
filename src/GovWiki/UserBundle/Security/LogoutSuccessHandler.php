<?php

namespace GovWiki\UserBundle\Security;

use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Http\Logout\LogoutSuccessHandlerInterface;

/**
 * Class LogoutSuccessHandler
 * @package GovWiki\FrontendBundle\Redirection
 */
class LogoutSuccessHandler implements LogoutSuccessHandlerInterface
{

    /**
     * Creates a Response object to send upon a successful logout.
     *
     * @param Request $request A Request instance.
     *
     * @return \Symfony\Component\HttpFoundation\Response never null.
     *
     * @throws \InvalidArgumentException Can't create RedirectResponse.
     */
    public function onLogoutSuccess(Request $request)
    {
        $uri = $request->server->get('HTTP_REFERER');

        if (empty($uri)) {
            $uri = '/';
        }

        return new RedirectResponse($uri);
    }
}
