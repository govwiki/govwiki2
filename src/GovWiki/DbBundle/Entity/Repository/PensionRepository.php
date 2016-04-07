<?php

namespace GovWiki\DbBundle\Entity\Repository;

use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Query\QueryException;

/**
 * PensionRepository
 */
class PensionRepository extends EntityRepository
{
    /**
     * @param integer $government Government entity id.
     * @param integer $year       Year of data.
     *
     * @return \Doctrine\ORM\QueryBuilder
     */
    public function getListQuery($government, $year)
    {
        $expr = $this->_em->getExpressionBuilder();

        return $this->createQueryBuilder('Pension')
            ->addSelect('Employee, Job')
            ->join('Pension.employee', 'Employee')
            ->join('Pension.job', 'Job')
            ->where($expr->andX(
                $expr->eq('Pension.government', ':government'),
                $expr->eq('Pension.year', ':year')
            ))
            ->setParameters([
                'government' => $government,
                'year' => $year,
            ]);
    }

    /**
     * @param integer $government Government entity id.
     * @param integer $year       Year of data.
     *
     * @return boolean
     */
    public function has($government, $year)
    {
        $expr = $this->_em->getExpressionBuilder();

        try {
            return $this->createQueryBuilder('Pension')
                ->select($expr->count('Pension.id'))
                ->where($expr->andX(
                    $expr->eq('Pension.government', ':government'),
                    $expr->eq('Pension.year', ':year')
                ))
                ->setParameters([
                    'government' => $government,
                    'year'       => $year,
                ])
                ->getQuery()
                ->getSingleScalarResult() > 0;
        } catch (QueryException $e) {
            return false;
        }
    }
}
