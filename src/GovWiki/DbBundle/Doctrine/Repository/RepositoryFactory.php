<?php

namespace GovWiki\DbBundle\Doctrine\Repository;

use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Repository\DefaultRepositoryFactory;
use GovWiki\EnvironmentBundle\Storage\EnvironmentStorageInterface;

/**
 * Class RepositoryFactory
 * @package GovWiki\DbBundle\Doctrine\Repository
 */
class RepositoryFactory extends DefaultRepositoryFactory
{

    /**
     * @var EnvironmentStorageInterface
     */
    private $storage;

    /**
     * @param EnvironmentStorageInterface $storage A EnvironmentStorageInterface
     *                                             instance.
     */
    public function __construct(EnvironmentStorageInterface $storage)
    {
        $this->storage = $storage;
    }

    /**
     * Gets the repository for an entity class.
     *
     * @param \Doctrine\ORM\EntityManagerInterface $entityManager The EntityManager instance.
     * @param string                               $entityName    The name of the entity.
     *
     * @return \Doctrine\Common\Persistence\ObjectRepository
     */
    public function getRepository(EntityManagerInterface $entityManager, $entityName)
    {
        $repository = parent::getRepository($entityManager, $entityName);
        if ($repository instanceof EnvironmentStorageAwareInterface) {
            $repository->setEnvironmentStorage($this->storage);
        }

        return $repository;
    }
}
