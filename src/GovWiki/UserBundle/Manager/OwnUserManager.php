<?php

namespace GovWiki\UserBundle\Manager;

use Doctrine\ORM\EntityManager;
use FOS\UserBundle\Doctrine\UserManager;
use GovWiki\EnvironmentBundle\Storage\EnvironmentStorageInterface;
use GovWiki\UserBundle\Entity\User;
use Symfony\Component\Security\Core\Encoder\EncoderFactoryInterface;
use FOS\UserBundle\Util\CanonicalizerInterface;
use Symfony\Component\Security\Core\Exception\UsernameNotFoundException;
use GovWiki\DbBundle\Entity\Environment;

/**
 * Class OwnUserManager
 * @package GovWiki\UserBundle\Manager
 */
class OwnUserManager extends UserManager
{
    /**
     * @var EnvironmentStorageInterface
     */
    private $environmentStorage;

    public function __construct(
        EncoderFactoryInterface $encoderFactory,
        CanonicalizerInterface $usernameCanonicalizer,
        CanonicalizerInterface $emailCanonicalizer,
        EntityManager $em,
        $class,
        EnvironmentStorageInterface $environmentStorage
    ) {
        parent::__construct($encoderFactory, $usernameCanonicalizer, $emailCanonicalizer, $em, $class);

        $this->environmentStorage = $environmentStorage;
    }

    public function loadUserByUsername($username)
    {
        @trigger_error('Using the UserManager as user provider is deprecated. Use FOS\UserBundle\Security\UserProvider instead.', E_USER_DEPRECATED);

        $user = $this->findUserByUsername($username);

        if (!$user instanceof User) {
            throw new UsernameNotFoundException(sprintf('No user with name "%s" was found.', $username));
        }

        if (!$user->hasRole('ROLE_ADMIN')) {
            /** @var Environment $current_environment */
            $current_environment = $this->environmentStorage->get();
            $user_environment_list = $user->getEnvironments();
            if (!$user_environment_list->contains($current_environment)) {
                throw new UsernameNotFoundException(sprintf('No user with name "%s" was found.', $username));
            }
        }

        return $user;
    }
}
