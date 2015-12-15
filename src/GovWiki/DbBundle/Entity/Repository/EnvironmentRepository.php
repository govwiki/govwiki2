<?php

namespace GovWiki\DbBundle\Entity\Repository;

use Doctrine\ORM\Query\QueryException;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\NonUniqueResultException;
use Doctrine\ORM\ORMException;
use GovWiki\DbBundle\Entity\Environment;
use GovWiki\UserBundle\Entity\User;

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
            ->select('partial Environment.{id,name,domain,enabled}')
            ->orderBy('Environment.name')
            ->getQuery();
    }

    /**
     * @param integer $user        User id.
     * @param string  $environment Environment name.
     *
     * @return Environment|null
     */
    public function getByName($user, $environment)
    {
        $qb = $this->createQueryBuilder('Environment');
        $expr = $qb->expr();

        try {
            return $qb
                ->addSelect('Map')
                ->leftJoin('Environment.map', 'Map')
                ->leftJoin('Environment.users', 'User')
                ->where(
                    $expr->andX(
                        $expr->eq(
                            'Environment.name',
                            $expr->literal($environment)
                        ),
                        $expr->eq('User.id', $user)
                    )
                )
                ->getQuery()
                ->getOneOrNullResult();
        } catch (NonUniqueResultException $e) {
            return null;
        }
    }

    /**
     * @param integer $user User id.
     * @param string  $name Environment name.
     *
     * @return boolean|\Doctrine\Common\Proxy\Proxy|null|object
     */
    public function getReferenceByName($user, $name)
    {
        $qb = $this->createQueryBuilder('Environment');
        $expr = $qb->expr();

        try {
            $id = $qb
                ->select('Environment.id')
                ->leftJoin('Environment.users', 'User')
                ->where(
                    $expr->andX(
                        $expr->eq('Environment.name', $expr->literal($name)),
                        $expr->eq('User.id', $user)
                    )
                )
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
                ->select('Environment.name')
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
}
