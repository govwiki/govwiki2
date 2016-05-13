<?php

namespace GovWiki\DbBundle\Entity\Repository;

use Doctrine\ORM\EntityRepository;

/**
 * Class LegislationRepository
 * @package GovWiki\DbBundle\Entity\Repository
 */
class LegislationRepository extends EntityRepository
{
    /**
     * @param integer $environment A Environment entity id.
     *
     * @return \Doctrine\ORM\Query
     */
    public function getListQuery($environment)
    {
        $expr = $this->_em->getExpressionBuilder();

        return $this->createQueryBuilder('Legislation')
            ->addSelect('IssueCategory')
            ->leftJoin('Legislation.government', 'Government')
            ->leftJoin('Legislation.issueCategory', 'IssueCategory')
            ->where($expr->eq('Government.environment', ':environment'))
            ->setParameter('environment', $environment)
            ->getQuery();
    }
}
