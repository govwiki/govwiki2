<?php

namespace GovWiki\DbBundle\Entity\Repository;

use Doctrine\ORM\EntityRepository;
use GovWiki\DbBundle\Entity\EditRequest;

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

    /**
     * @param integer $environment A Environment entity id.
     * @param string  $entityName  Edited entity name.
     * @param integer $entityId    Edited entity id.
     *
     * @return array
     */
    public function getUnapprovedFor($environment, $entityName, $entityId)
    {
        $expr = $this->_em->getExpressionBuilder();

        return $this->createQueryBuilder('EditRequest')
            ->select(
                'partial EditRequest.{id}',
                'partial User.{id}'
            )
            ->leftJoin('EditRequest.user', 'User')
            ->where($expr->andX(
                $expr->eq('EditRequest.environment', ':environment'),
                $expr->eq('EditRequest.entityName', ':entity_name'),
                $expr->eq('EditRequest.entityId', ':entity_id'),
                $expr->eq('EditRequest.status', ':status')
            ))
            ->setParameters([
                'environment' => $environment,
                'entity_name' => $entityName,
                'entity_id' => $entityId,
                'status' => 'pending',
            ])
            ->getQuery()
            ->getArrayResult();
    }
}
