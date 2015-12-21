<?php

namespace GovWiki\DbBundle\Entity\Repository;

use Doctrine\ORM\EntityRepository;

/**
 * TabRepository
 */
class TabRepository extends EntityRepository
{
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
