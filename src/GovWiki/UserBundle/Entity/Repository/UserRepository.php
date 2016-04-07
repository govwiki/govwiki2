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
     * @param integer $government Government id.
     *
     * @return array
     */
    public function getGovernmentSubscribersEmailData($government)
    {
        return $this->getGovernmentSubscribersQuery($government)
            ->select('User.email, User.username')
            ->getQuery()
            ->getResult();
    }

    /**
     * @return array
     */
    public function getAdminsList()
    {
        return $this->createQueryBuilder('User')
            ->select('User')
            ->where('User.roles LIKE :role')
            ->setParameter('role', '%ROLE_ADMIN%')
            ->getQuery()
            ->getResult();
    }

    /**
     * Get all subscribers for given government.
     *
     * @param integer $government Government entity id.
     *
     * @return array
     */
    public function getSubscriberIds($government)
    {
        $expr = $this->_em->getExpressionBuilder();

        $result = $this->createQueryBuilder('User')
            ->select('User.id')
            ->innerJoin('User.subscribedTo', 'Government')
            ->where($expr->eq('Government.id', ':government'))
            ->setParameter('government', $government)
            ->getQuery()
            ->getArrayResult();

        return array_map(
            function (array $row) {
                return $row['id'];
            },
            $result
        );
    }
}
