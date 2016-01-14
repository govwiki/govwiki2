<?php

namespace GovWiki\UserBundle\Security;

use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Http\Authentication\AuthenticationSuccessHandlerInterface;
use Symfony\Component\Security\Http\Logout\LogoutSuccessHandlerInterface;

/**
 * Class LoginSuccessHandler
 * @package GovWiki\FrontendBundle\Redirection
 */
class LoginSuccessHandler implements AuthenticationSuccessHandlerInterface
{
    /**
     * {@inheritdoc}
     */
    public function onAuthenticationSuccess(
        Request $request,
        TokenInterface $token
    ) {
        $referer = $request->server->get('HTTP_REFERER');

        if (!empty($referer)) {
            return new RedirectResponse($referer);
        }

        return new RedirectResponse('/');
    }
}
