<?php

namespace GovWiki\UserBundle\Entity\Repository;

use Doctrine\ORM\EntityRepository;

/**
 * UserRepository
 */
class UserRepository extends EntityRepository
{
    /**
     * Get all government subscribers query.
     *
     * @param integer $government Government id.
     *
     * @return \Doctrine\ORM\QueryBuilder
     */
    public function getGovernmentSubscribersQuery($government)
    {
        $expr = $this->_em->getExpressionBuilder();

        return $this->createQueryBuilder('User')
            ->innerJoin('User.subscribedTo', 'Government')
            ->where($expr->in('Government.id', [ $government ]));
    }

    /**
     * @param integer $environment A Environment entity id.
     * @param boolean $onlyAdmins  Show only admins.
     *
     * @return \Doctrine\ORM\QueryBuilder
     */
    public function getListQueryForEnvironment($environment, $onlyAdmins = false)
    {
        $expr = $this->_em->getExpressionBuilder();

        $qb = $this->createQueryBuilder('User');

        if ($onlyAdmins) {
            $qb->where("REGEXP('ROLE_ADMIN', User.roles) = 1");
        } else {
            $qb
                ->join('User.environments', 'Environment')
                ->where($expr->andX(
                    $expr->eq('Environment.id', ':environment'),
                    "REGEXP('ROLE_ADMIN', User.roles) = 0"
                ))
                ->setParameter('environment', $environment);
        }

        return $qb;
    }
}
