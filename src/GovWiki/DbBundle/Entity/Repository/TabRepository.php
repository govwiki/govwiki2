<?php

namespace GovWiki\DbBundle\Entity\Repository;

use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Query;
use GovWiki\DbBundle\Entity\Tab;

/**
 * TabRepository
 */
class TabRepository extends EntityRepository
{

    /**
     * @param integer $environment A Environment entity id.
     * @param integer $except      A Tab entity id.
     *
     * @return Tab[]
     */
    public function get($environment, $except = null)
    {
        $expr = $this->_em->getExpressionBuilder();

        return $this->getQueryBuilder($environment, $except)
            ->orderBy($expr->asc('Tab.orderNumber'))
            ->addOrderBy($expr->asc('Category.orderNumber'))
            ->getQuery()
            ->getResult();
    }

    /**
     * @param integer $environment A Environment entity id.
     * @param integer $except      A Tab entity id.
     *
     * @return \Doctrine\ORM\QueryBuilder
     */
    public function getQueryBuilder($environment, $except = null)
    {
        $expr = $this->_em->getExpressionBuilder();

        $qb = $this->createQueryBuilder('Tab')
            ->addSelect('Category, Format, Child')
            ->leftJoin('Tab.categories', 'Category')
            ->leftJoin('Category.formats', 'Format')
            ->leftJoin('Tab.childrens', 'Child')
            ->where($expr->eq('Tab.environment', ':environment'))
            ->setParameter('environment', $environment);

        if ($except) {
            $qb
                ->andWhere($expr->neq('Tab.id', ':tab'))
                ->setParameter('tab', $except);
        }

        return $qb;
    }

    /**
     * @param integer $environment A Environment entity id.
     * @param string  $altType     A Government entity altType.
     *
     * @return array
     */
    public function getForGovernment($environment, $altType)
    {
        $expr = $this->_em->getExpressionBuilder();

        return $this->getQueryBuilder($environment)
            ->addSelect('Parent')
            ->leftJoin('Tab.parent', 'Parent')
            ->andWhere($expr->andX(
                $expr->orX(
                    "REGEXP('{$altType}', Format.showIn) = 1",
                    $expr->neq('Tab.tabType', $expr->literal(Tab::USER_DEFINED))
                )
            ))
            ->setParameter('environment', $environment)
            ->orderBy($expr->asc('Tab.orderNumber'))
            ->addOrderBy($expr->asc('Category.orderNumber'))
            ->getQuery()
            ->getArrayResult();
    }

    /**
     * @param string $environment Environment name.
     *
     * @return \Doctrine\ORM\Query
     */
    public function getListQuery($environment)
    {
        $qb = $this->createQueryBuilder('Tab');
        $expr = $qb->expr();

        return $qb
            ->select('Tab.id, Tab.name, Tab.orderNumber')
            ->join('Tab.environment', 'Environment')
            ->where($expr->eq('Environment.slug', $expr->literal($environment)))
            ->orderBy($expr->asc('Tab.orderNumber'))
            ->addOrderBy($expr->asc('Tab.name'))
            ->getQuery();
    }

    /**
     * @param string  $environment Environment name.
     * @param integer $orderNumber Current order number.
     *
     * @return integer
     */
    public function getPreviousOrderNumber($environment, $orderNumber)
    {
        $qb = $this->createQueryBuilder('Tab');
        $expr = $qb->expr();

        try {
            $result = $qb
                ->select('Tab.orderNumber')
                ->join('Tab.environment', 'Environment')
                ->where(
                    $expr->andX(
                        $expr->eq('Environment.slug', $expr->literal($environment)),
                        $expr->lt('Tab.orderNumber', $orderNumber)
                    )
                )
                ->orderBy($expr->desc('Tab.orderNumber'))
                ->setMaxResults(1)
                ->getQuery()
                ->getSingleScalarResult();
        } catch (\Exception $e) {
            return 0;
        }

        if (null === $result) {
            return 0;
        }

        return $result;
    }

    /**
     * @param string  $environment Environment name.
     * @param integer $orderNumber Current order number.
     *
     * @return integer
     */
    public function getNextOrderNumber($environment, $orderNumber)
    {
        $qb = $this->createQueryBuilder('Tab');
        $expr = $qb->expr();

        try {
            $result = $qb
                ->select('Tab.orderNumber')
                ->join('Tab.environment', 'Environment')
                ->where(
                    $expr->andX(
                        $expr->eq('Environment.slug', $expr->literal($environment)),
                        $expr->gt('Tab.orderNumber', $orderNumber)
                    )
                )
                ->orderBy($expr->asc('Tab.orderNumber'))
                ->setMaxResults(1)
                ->getQuery()
                ->getSingleScalarResult();
        } catch (\Exception $e) {
            return $orderNumber + 1;
        }

        if (null === $result) {
            return $orderNumber + 1;
        }

        return $result;
    }
}
