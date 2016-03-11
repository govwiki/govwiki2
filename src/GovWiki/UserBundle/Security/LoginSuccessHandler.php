<?php

namespace GovWiki\UserBundle\Security;

use Doctrine\ORM\EntityManagerInterface;
use GovWiki\ApiBundle\Manager\EnvironmentManagerAwareInterface;
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
     * {@inheritdoc}
     */
    public function onAuthenticationSuccess(
        Request $request,
        TokenInterface $token
    ) {
        $referer = $request->server->get('HTTP_REFERER');

        if (!empty($referer)) {

            /** @var User $user */
            $user = $token->getUser();

            if (strpos($referer, 'login')) {
                if ($user->hasRole('ROLE_ADMIN') || $user->hasRole('ROLE_MANAGER')) {
                    /*
                     * Admin.
                     */
                    return new RedirectResponse(
                        $this->router->generate('govwiki_admin_main_home')
                    );
                } else {
                    /*
                     * Ordinary user.
                     */
                    return new RedirectResponse(
                        $this->router->generate('main')
                    );
                }
            }

            return new RedirectResponse($referer);
        }
        return new RedirectResponse('/');
    }
}
