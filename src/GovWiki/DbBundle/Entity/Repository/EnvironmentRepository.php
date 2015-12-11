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
     * @return \Doctrine\ORM\Query
     */
    public function getListQuery()
    {
        $qb = $this->createQueryBuilder('Environment');

        return $qb
            ->select('partial Environment.{id,name,domain,enabled}')
            ->orderBy('Environment.name')
            ->getQuery();
    }

    /**
     * @param string $environment Environment name.
     *
     * @return Environment|null
     */
    public function getByName($environment)
    {
        $qb = $this->createQueryBuilder('Environment');
        $expr = $qb->expr();

        try {
            return $qb
                ->select('Environment')
                ->where($expr->eq('Environment.name', $expr->literal($environment)))
                ->getQuery()
                ->getOneOrNullResult();
        } catch (NonUniqueResultException $e) {
            return null;
        }
    }

    /**
     * @param string $name Environment name.
     *
     * @return boolean|\Doctrine\Common\Proxy\Proxy|null|object
     */
    public function getReferenceByName($name)
    {
        $qb = $this->createQueryBuilder('Environment');
        $expr = $qb->expr();

        try {
            $id = $qb
                ->select('Environment.id')
                ->where($expr->eq('Environment.name', $expr->literal($name)))
                ->getQuery()
                ->getSingleScalarResult();
        } catch (ORMException $e) {
            return null;
        }

        return $this->_em->getReference($this->_entityName, $id);
    }
}
