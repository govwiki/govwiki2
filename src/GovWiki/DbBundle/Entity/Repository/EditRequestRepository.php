<?php

namespace GovWiki\DbBundle\Entity\Repository;

use Doctrine\ORM\EntityRepository;

/**
 * EditRequestRepository
 */
class EditRequestRepository extends EntityRepository
{
    /**
     * @param integer $environment A Environment entity id.
     *
     * @return \Doctrine\ORM\Query
     */
    public function getListQuery($environment)
    {
        $expr = $this->_em->getExpressionBuilder();

        return $this->createQueryBuilder('EditRequest')
            ->addSelect('User')
            ->leftJoin('EditRequest.user', 'User')
            ->where($expr->eq('EditRequest.environment', ':environment'))
            ->setParameter('environment', $environment)
            ->orderBy($expr->desc('EditRequest.created'))
            ->getQuery();
    }
}
