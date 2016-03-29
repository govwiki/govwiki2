<?php

namespace GovWiki\UserBundle\Manager;

use Doctrine\ORM\EntityManager;
use FOS\UserBundle\Doctrine\UserManager;
use GovWiki\ApiBundle\Manager\EnvironmentManager;
use Symfony\Component\Security\Core\Encoder\EncoderFactoryInterface;
use FOS\UserBundle\Util\CanonicalizerInterface;
use Symfony\Component\Security\Core\Exception\UsernameNotFoundException;
use GovWiki\DbBundle\Entity\Environment;

class OwnUserManager extends UserManager
{
    /**
     * @var EnvironmentManager
     */
    private $environment_manager;

    public function __construct(
        EncoderFactoryInterface $encoderFactory,
        CanonicalizerInterface $usernameCanonicalizer,
        CanonicalizerInterface $emailCanonicalizer,
        EntityManager $em,
        $class,
        EnvironmentManager $environment_manager
    ) {
        parent::__construct($encoderFactory, $usernameCanonicalizer, $emailCanonicalizer, $em, $class);

        $this->environment_manager = $environment_manager;
    }

    public function loadUserByUsername($username)
    {
        @trigger_error('Using the UserManager as user provider is deprecated. Use FOS\UserBundle\Security\UserProvider instead.', E_USER_DEPRECATED);

        $user = $this->findUserByUsername($username);

        if (!$user) {
            throw new UsernameNotFoundException(sprintf('No user with name "%s" was found.', $username));
        }

        /** @var Environment $current_environment */
        $current_environment = $this->environment_manager->getEntity();
        $user_environment_list = $user->getEnvironments();
        if (!$user_environment_list->contains($current_environment)) {
            throw new UsernameNotFoundException(sprintf('No user with name "%s" was found.', $username));
        }

        return $user;
    }
}