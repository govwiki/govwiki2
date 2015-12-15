<?php

namespace GovWiki\AdminBundle\Manager;

use Doctrine\ORM\EntityManagerInterface;
use GovWiki\ApiBundle\Manager\EnvironmentManagerAwareInterface;
use GovWiki\UserBundle\Entity\User;
use Symfony\Component\Finder\Exception\AccessDeniedException;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

/**
 * Class AdminEnvironmentManager
 * @package GovWiki\AdminBundle\Manager
 */
class AdminEnvironmentManager implements EnvironmentManagerAwareInterface
{
    /**
     * @var EntityManagerInterface
     */
    private $em;

    /**
     * @var string
     */
    private $environment;

    /**
     * @var User
     */
    private $user;

    /**
     * @param EntityManagerInterface $em      A EntityManagerInterface instance.
     * @param TokenStorageInterface  $storage A TokenStorageInterface instance.
     */
    public function __construct(
        EntityManagerInterface $em,
        TokenStorageInterface $storage
    ) {
        $this->em = $em;

        $token = $storage->getToken();

        if (null === $token) {
            throw new AccessDeniedException();
        }

        $this->user = $token->getUser();
    }

    /**
     * {@inheritdoc}
     */
    public function setEnvironment($environment)
    {
        $this->environment = $environment;

        return $this;
    }

    /**
     * @return string
     */
    public function getEnvironment()
    {
        return $this->environment;
    }

    /**
     * @return \GovWiki\DbBundle\Entity\Environment|null
     */
    public function getEntity()
    {
        return $this->em->getRepository('GovWikiDbBundle:Environment')
            ->getByName($this->user->getId(), $this->environment);
    }

    /**
     * @return boolean|\Doctrine\Common\Proxy\Proxy|null
     */
    public function getReference()
    {
        return $this->em
            ->getRepository('GovWikiDbBundle:Environment')
            ->getReferenceByName($this->environment);
    }

    /**
     * @return AdminEnvironmentManager
     */
    public function disable()
    {
        $entity = $this->getEntity();
        $entity->setEnabled(false);

        $this->em->persist($entity);
        $this->em->flush();

        return $this;
    }

    /**
     * @return AdminEnvironmentManager
     */
    public function enable()
    {
        $entity = $this->getEntity();
        $entity->setEnabled(true);

        $this->em->persist($entity);
        $this->em->flush();

        return $this;
    }

    public function remove()
    {

    }
}
