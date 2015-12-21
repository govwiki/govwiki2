<?php

namespace GovWiki\DbBundle\Entity\Repository;

use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\NonUniqueResultException;
use Doctrine\ORM\ORMException;
use GovWiki\DbBundle\Entity\Environment;

/**
 * EnvironmentRepository
 */
class EnvironmentRepository extends EntityRepository
{
    /**
     * @param integer $id User id, if set get environment where given user is
     *                    manager.
     *
     * @return \Doctrine\ORM\Query
     */
    public function getListQuery($id = null)
    {
        $qb = $this->createQueryBuilder('Environment');
        $expr = $qb->expr();

        if (null !== $id) {
            $qb->where($expr->eq('Environment.users', $id));
        }

        return $qb
            ->select('partial Environment.{id,name,domain,enabled,slug}')
            ->orderBy('Environment.slug')
            ->getQuery();
    }

    /**
     * @param string  $environment Environment name.
     * @param integer $user        User id.
     *
     * @return Environment|null
     */
    public function getByName($environment, $user = null)
    {
        $qb = $this->createQueryBuilder('Environment');
        $expr = $qb->expr();

        try {
            $qb
                ->addSelect('Map')
                ->leftJoin('Environment.map', 'Map')
                ->leftJoin('Environment.users', 'User')
                ->where($expr->eq(
                    'Environment.slug',
                    $expr->literal($environment)
                ));

            if (null !== $user) {
                $qb->andWhere($expr->eq('User.id', $user));
            }

            return $qb
                ->getQuery()
                ->getOneOrNullResult();
        } catch (NonUniqueResultException $e) {
            return null;
        }
    }

    /**
     * @param string  $environment Environment name.
     * @param integer $user        User id.
     *
     * @return boolean|\Doctrine\Common\Proxy\Proxy|null|object
     */
    public function getReferenceByName($environment, $user = null)
    {
        $qb = $this->createQueryBuilder('Environment');
        $expr = $qb->expr();

        try {
            $qb
                ->select('Environment.id')
                ->leftJoin('Environment.users', 'User')
                ->where($expr->eq('Environment.slug', $expr->literal($environment)));

            if (null !== $user) {
                $qb->andWhere($expr->eq('User.id', $user));
            }

            $id = $qb
                ->getQuery()
                ->getSingleScalarResult();
        } catch (ORMException $e) {
            return null;
        }

        return $this->_em->getReference($this->_entityName, $id);
    }

    /**
     * Resolve domain name to environment name.
     *
     * @param string $domain Environment domain name.
     *
     * @return string|null
     */
    public function getNameByDomain($domain)
    {
        $qb = $this->createQueryBuilder('Environment');
        $expr = $qb->expr();

        try {
            return $qb
                ->select('Environment.slug')
                ->where($expr->andX(
                    $expr->eq(
                        'Environment.domain',
                        $expr->literal($domain)
                    ),
                    $expr->eq('Environment.enabled', 1)
                ))
                ->getQuery()
                ->getSingleScalarResult();
        } catch (ORMException $e) {
            return null;
        }
    }

    /**
     * @param string $environment A Environment name.
     *
     * @return array|null
     */
    public function getStyle($environment)
    {
        $qb = $this->createQueryBuilder('Environment');
        $expr = $qb->expr();

        try {
            return $qb
                ->select('Environment.style')
                ->where(
                    $expr->eq('Environment.slug', $expr->literal($environment))
                )
                ->getQuery()
                ->getSingleResult()['style'];
        } catch (ORMException $e) {
            return null;
        }
    }
}
