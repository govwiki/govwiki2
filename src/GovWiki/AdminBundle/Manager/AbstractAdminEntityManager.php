<?php

namespace GovWiki\AdminBundle\Manager;

use Doctrine\ORM\EntityManagerInterface;
use GovWiki\DbBundle\Entity\Environment;

/**
 * Class AbstractAdminEntityManager
 * @package GovWiki\AdminBundle\Manager
 */
abstract class AbstractAdminEntityManager implements
    AdminEntityManagerAwareInterface
{
    /**
     * @var EntityManagerInterface
     */
    private $em;

    /**
     * @var string
     */
    protected $environment;

    /**
     * @var integer
     */
    private $environmentId;

    /**
     * @param Environment $environment A Environment instance.
     */
    public function __construct(EntityManagerInterface $em) {
        $this->em = $em;
    }

    /**
     * {@inheritdoc}
     */
    public function setEnvironment($environment)
    {
        $this->environment = $environment;
    }

    /**
     * {@inheritdoc}
     */
    public function setEnvironmentId($id)
    {
        $this->environmentId = $id;
    }

    /**
     * @return string
     */
    public function getEnvironment()
    {
        return $this->environment;
    }

    /**
     * Create new entity object.
     *
     * @return object
     */
    public function create()
    {
        $className = $this->getEntityClassName();
        return new $className();
    }

    /**
     * @param object  $entity   Entity object.
     * @param boolean $andFlush Flag, if is set flush change after persist.
     *
     * @return AbstractAdminEntityManager
     *
     * @throws \InvalidArgumentException If entity is not supported.
     */
    public function update($entity, $andFlush = true)
    {
        $className = $this->getEntityClassName();
        if (! $entity instanceof $className) {
            throw new \InvalidArgumentException();
        }

        $entity = $this->beforeUpdate($entity);

        $this->em->persist($entity);
        if ($andFlush) {
            $this->em->flush();
        }

        return $this;
    }

    /**
     * @return object
     */
    protected function beforeUpdate($entity)
    {
        return $entity;
    }

    /**
     * Return entity class name managed by current manager.
     *
     * @return string
     */
    abstract protected function getEntityClassName();

    /**
     * @return \Doctrine\ORM\EntityRepository
     */
    protected function getRepository()
    {
        return $this->em->getRepository($this->getEntityClassName());
    }

    /**
     * @param string $alias Entity alias.
     *
     * @return \Doctrine\ORM\QueryBuilder
     */
    protected function createQueryBuilder($alias)
    {
        return $this->getRepository()->createQueryBuilder($alias);
    }

    /**
     * @return Environment
     */
    protected function getEnvironmentReference()
    {
        return $this->em->getReference(
            'GovWiki\DbBundle\Entity\Environment',
            $this->environmentId
        );
    }
}
