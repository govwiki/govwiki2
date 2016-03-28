<?php

namespace GovWiki\UserBundle\EventListener;

use Doctrine\ORM\EntityManagerInterface;
use FOS\UserBundle\Event\FilterUserResponseEvent;
use FOS\UserBundle\Event\UserEvent;
use FOS\UserBundle\FOSUserEvents;
use GovWiki\DbBundle\Entity\Chat;
use GovWiki\DbBundle\Entity\Government;
use GovWiki\UserBundle\Entity\User;
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

    /**
     * @var EntityManagerInterface
     */
    private $em;

    /**
     * @param Session                $session      A Session instance.
     * @param TokenStorageInterface  $tokenStorage A TokenStorageInterface
     *                                             instance.
     * @param EntityManagerInterface $em           A EntityManagerInterface
     *                                             instance.
     */
    public function __construct(
        Session $session,
        TokenStorageInterface $tokenStorage,
        EntityManagerInterface $em
    ) {
        $this->session = $session;
        $this->tokenStorage = $tokenStorage;
        $this->em = $em;
    }

/**
     * {@inheritdoc}
     */
    public static function getSubscribedEvents()
    {
        return [
            FOSUserEvents::REGISTRATION_INITIALIZE => 'registrationInitialize',
            FOSUserEvents::REGISTRATION_COMPLETED => 'registrationCompleted',
        ];
    }

    /**
     * @param UserEvent $event A UserEvent instance.
     *
     * @return void
     */
    public function registrationInitialize(UserEvent $event)
    {
        $referer = $event->getRequest()->server->get('HTTP_REFERER');
        if (strpos($referer, 'register') === false) {
            $this->session->set('_security.main.target_path', $referer);
        }
    }

    /**
     * @param FilterUserResponseEvent $event A FilterUserResponseEvent instance.
     *
     * @return void
     */
    public function registrationCompleted(FilterUserResponseEvent $event)
    {
        /** @var User $user */
        $user = $event->getUser();
        $governments = $user->getSubscribedTo();

        if ((null !== $governments) && ! $governments->isEmpty()) {
            /** @var Government $government */
            foreach ($governments as $government) {
                $chat = new Chat();
                $chat->setGovernment($government);
                $government->setChat($chat);

                $this->em->persist($government);
            }
        }

        $this->em->flush();
    }
}
