<?php

namespace GovWiki\UserBundle\Controller;

use FOS\UserBundle\Controller\SecurityController as BaseController;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Security;
use Symfony\Component\Security\Core\SecurityContextInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;

/**
 * Class SecurityController
 * @package GovWiki\UserBundle\Controller
 */
class SecurityController extends BaseController
{
    /**
     * @Route("/login", name="login")
     *
     * @param Request $request A Request instance.
     *
     * @return Response|JsonResponse
     */
    public function loginAction(Request $request)
    {
        /** @var $session \Symfony\Component\HttpFoundation\Session\Session */
        $session = $request->getSession();

        if (class_exists('\Symfony\Component\Security\Core\Security')) {
            $authErrorKey = Security::AUTHENTICATION_ERROR;
            $lastUsernameKey = Security::LAST_USERNAME;
        } else {
            // BC for SF < 2.6
            $authErrorKey = SecurityContextInterface::AUTHENTICATION_ERROR;
            $lastUsernameKey = SecurityContextInterface::LAST_USERNAME;
        }

        // get the error if any (works with forward and redirect -- see below)
        if ($request->attributes->has($authErrorKey)) {
            $error = $request->attributes->get($authErrorKey);
        } elseif (null !== $session && $session->has($authErrorKey)) {
            $error = $session->get($authErrorKey);
            $session->remove($authErrorKey);
        } else {
            $error = null;
        }

        if (!$error instanceof AuthenticationException) {
            $error = null; // The value does not come from the security component.
        }

        // last username entered by the user
        $lastUsername = (null === $session) ? '' : $session->get($lastUsernameKey);

        if ($this->has('security.csrf.token_manager')) {
            $csrfToken = $this->get('security.csrf.token_manager')->getToken('authenticate')->getValue();
        } else {
            // BC for SF < 2.4
            $csrfToken = $this->has('form.csrf_provider')
                ? $this->get('form.csrf_provider')->generateCsrfToken('authenticate')
                : null;
        }

        if ($request->isXmlHttpRequest() and $error) {
            return new JsonResponse(['error' => $error->getMessageKey()]);
        } else {
            return $this->renderLogin([
                'last_username' => $lastUsername,
                'error'         => $error,
                'csrf_token'    => $csrfToken,
            ]);
        }
    }

    /**
     * @param array $data Template parameters.
     *
     * @return Response
     */
    protected function renderLogin(array $data)
    {
        if ($this->getRequest()->isXmlHttpRequest()) {
            return $this->render('GovWikiUserBundle:Security:ajax_login.html.twig', $data);
        } else {
            return $this->render('FOSUserBundle:Security:login.html.twig', $data);
        }
    }

    /**
     * @Route("/login_check", name="login_check")
     * @return void
     */
    protected function loginCheckAction()
    {
    }
}
