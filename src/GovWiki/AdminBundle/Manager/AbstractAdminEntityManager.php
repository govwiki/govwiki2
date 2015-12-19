<?php

namespace GovWiki\AdminBundle\Manager;

use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\EntityRepository;
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
     * @return void
     */
    public function flush()
    {
        $this->em->flush();
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

    /**
     * @param array $columns Array of columns name for fetching data from
     *                       repository.
     *
     * @return array
     */
    public function getAll(array $columns)
    {
        /** @var EntityRepository $repository */
        $repository = $this->getRepository();

        $alias = substr(
            $this->getEntityClassName(),
            strrpos($this->getEntityClassName(), '\\') + 1
        );

        foreach ($columns as &$column) {
            $column = "$alias.$column";
        }

        $qb = $repository->createQueryBuilder($alias)
            ->select(implode(',', $columns));
        $expr = $qb->expr();

        return $qb
            ->join($alias.'.environment', 'Environment')
            ->where(
                $expr->eq('Environment.name', $expr->literal($this->environment))
            )
            ->getQuery()
            ->getArrayResult();
    }
}
