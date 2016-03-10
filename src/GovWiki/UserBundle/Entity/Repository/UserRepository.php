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
}
