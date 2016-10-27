<?php

namespace GovWiki\UserBundle\Manager;

use FOS\UserBundle\Model\UserManagerInterface;
use FOS\UserBundle\Security\UserProvider;
use GovWiki\DbBundle\Entity\Environment;
use GovWiki\EnvironmentBundle\Storage\EnvironmentStorageInterface;
use GovWiki\UserBundle\Entity\User;
use Symfony\Component\Security\Core\Exception\UsernameNotFoundException;

/**
 * Class OwnUserManager
 * @package GovWiki\UserBundle\Manager
 */
class OwnUserManager extends UserProvider
{
    /**
     * @var EnvironmentStorageInterface
     */
    private $environmentStorage;

    public function __construct(
        UserManagerInterface $userManager,
        EnvironmentStorageInterface $environmentStorage
    ) {
        parent::__construct($userManager);

        $this->environmentStorage = $environmentStorage;
    }

    public function loadUserByUsername($username)
    {
        @trigger_error('Using the UserManager as user provider is deprecated. Use FOS\UserBundle\Security\UserProvider instead.', E_USER_DEPRECATED);

        $user = $this->findUser($username);

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
