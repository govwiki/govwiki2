<?php

namespace GovWiki\UserBundle\Security;

use Doctrine\ORM\EntityManagerInterface;
use GovWiki\UserBundle\Entity\User;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Http\Authentication\AuthenticationSuccessHandlerInterface;

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
     * @var EntityManagerInterface
     */
    private $em;

    /**
     * @param RouterInterface        $router A RouterInterface instance.
     * @param EntityManagerInterface $em     A EntityManagerInterface instance.
     */
    public function __construct(
        RouterInterface $router,
        EntityManagerInterface $em
    ) {
        $this->router = $router;
        $this->em = $em;
    }

    /**
     * This is called when an interactive authentication attempt succeeds. This
     * is called by authentication listeners inheriting from
     * AbstractAuthenticationListener.
     *
     * @param Request        $request A Request instance.
     * @param TokenInterface $token   A TokenInterface instance.
     *
     * @return \Symfony\Component\HttpFoundation\Response never null
     *
     * @throws \InvalidArgumentException Can't create RedirectResponse.
     */
    public function onAuthenticationSuccess(
        Request $request,
        TokenInterface $token
    ) {
        $referer = $request->server->get('HTTP_REFERER');
        // By default return back to main page.
        $uri = '/';

        if (!empty($referer)) {
            /** @var User $user */
            $user = $token->getUser();

            if (strpos($referer, 'login')) {
                if ($user->hasRole('ROLE_ADMIN') || $user->hasRole('ROLE_MANAGER')) {
                    // Admin or manager.
                    $uri = $this->router->generate('govwiki_admin_main_home');
                }
                // Ordinary user return to main page.
            } else {
                // Back to previous page.
                $uri = $referer;
            }
        }

        // Return to main page.
        return new RedirectResponse($uri);
    }
}
