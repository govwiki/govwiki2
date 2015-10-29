<?php

namespace GovWiki\UserBundle\Redirection;

use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Http\Logout\LogoutSuccessHandlerInterface;

/**
 * Class LogoutRedirection
 * @package GovWiki\FrontendBundle\Redirection
 */
class LogoutRedirection implements LogoutSuccessHandlerInterface
{
    /**
     * {@inheritdoc}
     */
    public function onLogoutSuccess(Request $request)
    {
        $referer = $request->server->get('HTTP_REFERER');

        if (!empty($referer)) {
            return new RedirectResponse($referer);
        }
        return new RedirectResponse('/');
    }
}
