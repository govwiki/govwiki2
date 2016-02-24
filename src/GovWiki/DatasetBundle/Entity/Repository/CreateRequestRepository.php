<?php

namespace GovWiki\DatasetBundle\Entity\Repository;

use Doctrine\ORM\EntityRepository;
use GovWiki\RequestBundle\Entity\Interfaces\CreatableInterface;
use GovWiki\RequestBundle\Entity\Interfaces\CreateRequestRepositoryInterface;
use GovWiki\RequestBundle\Entity\LegislationCreateRequest;

/**
 * CreateRequestRepository
 */
class CreateRequestRepository extends EntityRepository
{
    /**
     * @param string $environment Environment name.
     *
     * @return \Doctrine\ORM\Query
     */
    public function getListQuery($environment)
    {
        $qb = $this->createQueryBuilder('CreateRequest');
        $expr = $qb->expr();

        return $qb
            ->addSelect('Creator')
            ->join('CreateRequest.environment', 'Environment')
            ->join('CreateRequest.creator', 'Creator')
            ->where($expr->eq('Environment.slug', $expr->literal($environment)))
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
        $data = $qb
            ->where($qb->expr()->eq('CR.id', $id))
            ->getQuery()
            ->getOneOrNullResult();

        $s = $qb->getQuery()->getSQL();

        return $data;
    }
}
