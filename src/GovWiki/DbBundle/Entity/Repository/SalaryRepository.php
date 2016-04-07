<?php

namespace GovWiki\DbBundle\Entity\Repository;

use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Query\QueryException;

/**
 * SalaryRepository
 */
class SalaryRepository extends EntityRepository
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

        return $this->createQueryBuilder('Salary')
            ->addSelect('Employee, Job')
            ->join('Salary.employee', 'Employee')
            ->join('Salary.job', 'Job')
            ->where($expr->andX(
                $expr->eq('Salary.government', ':government'),
                $expr->eq('Salary.year', ':year')
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
            return $this->createQueryBuilder('Salary')
                ->select($expr->count('Salary.id'))
                ->where($expr->andX(
                    $expr->eq('Salary.government', ':government'),
                    $expr->eq('Salary.year', ':year')
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
