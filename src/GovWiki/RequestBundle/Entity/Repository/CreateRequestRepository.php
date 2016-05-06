<?php

namespace GovWiki\RequestBundle\Entity\Repository;

use Doctrine\ORM\EntityRepository;
use GovWiki\RequestBundle\Entity\Interfaces\CreatableInterface;
use GovWiki\RequestBundle\Entity\Interfaces\CreateRequestRepositoryInterface;

/**
 * CreateRequestRepository
 */
class CreateRequestRepository extends EntityRepository
{
    /**
     * @param integer $environment A Environment entity id.
     *
     * @return \Doctrine\ORM\Query
     */
    public function getListQuery($environment)
    {
        $expr = $this->_em->getExpressionBuilder();

        return $this->createQueryBuilder('CreateRequest')
            ->addSelect('Creator')
            ->join('CreateRequest.environment', 'Environment')
            ->join('CreateRequest.creator', 'Creator')
            ->where($expr->eq('CreateRequest.environment', ':environment'))
            ->setParameter('environment', $environment)
            ->orderBy($expr->asc('CreateRequest.createdAt'))
            ->getQuery();
    }

    /**
     * @param integer $id Entity id.
     *
     * @return CreatableInterface
     *
     * @throws \Doctrine\ORM\ORMException Can't get reference.
     */
    public function getOne($id)
    {
        $reference = $this->_em->getReference($this->_entityName, $id);
        /** @var CreateRequestRepositoryInterface $repository */
        $repository = $this->_em->getRepository(get_class($reference));

        $qb = $repository->getQueryBuilder('CR');
        return $qb
            ->where($qb->expr()->eq('CR.id', $id))
            ->getQuery()
            ->getOneOrNullResult();
    }
}
