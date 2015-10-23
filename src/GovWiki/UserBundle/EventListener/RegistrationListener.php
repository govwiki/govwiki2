<?php

namespace GovWiki\UserBundle\EventListener;

use FOS\UserBundle\Event\UserEvent;
use FOS\UserBundle\FOSUserEvents;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\Session\Session;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

/**
 * Class RegistrationListener
 * @package GovWiki\UserBundle\EventListener
 */
class RegistrationListener implements EventSubscriberInterface
{
    /**
     * @var Session
     */
    private $session;

    /**
     * @var TokenStorageInterface
     */
    private $tokenStorage;

    public function __construct(Session $session, TokenStorageInterface $tokenStorage)
    {
        $this->session = $session;
        $this->tokenStorage = $tokenStorage;
    }

/**
     * {@inheritdoc}
     */
    public static function getSubscribedEvents()
    {
        return [
            FOSUserEvents::REGISTRATION_INITIALIZE => 'registrationInitialize',
        ];
    }

    public function registrationInitialize(UserEvent $event)
    {
        $referer = $event->getRequest()->server->get('HTTP_REFERER');
        if (! preg_match('/register/', $referer)) {
            //$key = sprintf('_security.%s.target_path', $this->tokenStorage->getToken()->getProviderKey());
            $key = sprintf('_security.%s.target_path', 'main');
            $this->session->set($key, $referer);
        }
    }
}
