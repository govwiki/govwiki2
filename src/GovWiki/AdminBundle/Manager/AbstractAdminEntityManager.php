<?php

namespace GovWiki\AdminBundle\Manager;

use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\EntityRepository;
use GovWiki\DbBundle\Entity\Environment;
use GovWiki\EnvironmentBundle\Storage\EnvironmentStorageInterface;

/**
 * Class AbstractAdminEntityManager
 * @package GovWiki\AdminBundle\Manager
 */
abstract class AbstractAdminEntityManager
{
    /**
     * @var EntityManagerInterface
     */
    protected $em;

    /**
     * @var EnvironmentStorageInterface
     */
    protected $storage;

    /**
     * @param EntityManagerInterface      $em      A EntityManagerInterface
     *                                             instance.
     * @param EnvironmentStorageInterface $storage A EnvironmentStorageInterface
     *                                             instance.
     */
    public function __construct(
        EntityManagerInterface $em,
        EnvironmentStorageInterface $storage
    ) {
        $this->em = $em;
        $this->storage = $storage;
    }

    /**
     * @return Environment
     */
    public function getEnvironment()
    {
        return $this->storage->get();
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
     * Return entity class name managed by current manager.
     *
     * @return string
     */
    abstract protected function getEntityClassName();

    /**
     * @param array $columns Array of columns name for fetching data from
     *                       repository.
     *
     * @return array
     */
    public function getAll(array $columns = null, $offset = 0, $limit = null)
    {
        /** @var EntityRepository $repository */
        $repository = $this->getRepository();

        $alias = substr(
            $this->getEntityClassName(),
            strrpos($this->getEntityClassName(), '\\') + 1
        );

        $qb = $repository->createQueryBuilder($alias);
        if (count($columns) > 0) {
//            foreach ($columns as &$column) {
//                $column = "$alias.$column";
//            }
            $columns = array_map(
                function ($column) use ($alias) {
                    return "$alias.$column";
                },
                $columns
            );
            $qb->select(implode(',', $columns));
        }

        $expr = $qb->expr();

        if (null !== $limit) {
            $qb->setMaxResults($limit);
        }

        return $qb
            ->join($alias.'.environment', 'Environment')
            ->where(
                $expr->eq('Environment.slug', ':environment')
            )
            ->setParameter('environment', $this->getEnvironment()->getSlug())
            ->setFirstResult($offset)
            ->getQuery()
            ->getArrayResult();
    }

    /**
     * @param string $entityName Get for specified entity. If null get repository
     *                           for manged entity
     *                           {@see AbstractAdminEntityManager::getEntityClassName}.
     *
     * @return \Doctrine\ORM\EntityRepository
     */
    protected function getRepository($entityName = null)
    {
        if (null === $entityName) {
            $entityName = $this->getEntityClassName();
        }

        return $this->em->getRepository($entityName);
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
     * @param string $dql Dql statement.
     *
     * @return \Doctrine\ORM\Query
     */
    protected function createQuery($dql)
    {
        return $this->em->createQuery($dql);
    }
}
