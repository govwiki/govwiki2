<?php

namespace GovWiki\UserBundle\Security;

use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\RouterInterface;
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
     * @var RouterInterface
     */
    private $router;

    /**
     * @param RouterInterface $router A RouterInterface instance.
     */
    public function __construct(RouterInterface $router)
    {
        $this->router = $router;
    }

    /**
     * {@inheritdoc}
     */
    public function onAuthenticationSuccess(
        Request $request,
        TokenInterface $token
    ) {
        $referer = $request->server->get('HTTP_REFERER');

        if (!empty($referer)) {
            if (strpos($referer, 'login')) {
                return new RedirectResponse(
                    $this->router->generate('govwiki_admin_main_home')
                );
            }
            return new RedirectResponse($referer);
        }
        return new RedirectResponse('/');
    }
}
