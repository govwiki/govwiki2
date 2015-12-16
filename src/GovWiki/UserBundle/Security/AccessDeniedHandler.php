<?php

namespace GovWiki\UserBundle\Security;

use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Session\Session;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Component\Security\Http\Authorization\AccessDeniedHandlerInterface;

/**
 * Class AccessDeniedHandler
 * @package GovWiki\UserBundle\Redirection
 */
class AccessDeniedHandler implements AccessDeniedHandlerInterface
{
    /**
     * @var Session
     */
    private $session;

    /**
     * @param Session $session A Session instance.
     */
    public function __construct(Session $session)
    {
        $this->session = $session;
    }

    /**
     * {@inheritdoc}
     */
    public function handle(Request $request, AccessDeniedException $accessDeniedException)
    {
        if (strpos($request->getPathInfo(), 'admin') !== false) {
            $this->session->getFlashBag()->add('login', 'Only for admins');
            $request->getSession()->set('_security.main.target_path', '/admin/');
        }
        return new RedirectResponse('/login');
    }
}
