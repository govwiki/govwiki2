<?php

namespace GovWiki\DbBundle\Entity\Repository;

use Doctrine\ORM\EntityRepository;

/**
 * CategoryRepository
 */
class CategoryRepository extends EntityRepository
{
    /**
     * @param string $environment Environment name.
     *
     * @return \Doctrine\ORM\Query
     */
    public function getListQuery($environment)
    {
        $qb = $this->createQueryBuilder('Category');
        $expr = $qb->expr();

        return $qb
            ->select('Category.id, Category.name, Category.orderNumber')
            ->join('Category.environment', 'Environment')
            ->where($expr->eq('Environment.slug', $expr->literal($environment)))
            ->orderBy($expr->asc('Category.orderNumber'))
            ->addOrderBy($expr->asc('Category.name'))
            ->getQuery();
    }

    /**
     * @param string $environment Environment name.
     *
     * @return array
     */
    public function getNames($environment)
    {
        $qb = $this->createQueryBuilder('Category');
        $expr = $qb->expr();

        $buf = $qb
            ->select('Category.name, Category.id')
            ->join('Category.environment', 'Environment')
            ->where($expr->eq('Environment.slug', $expr->literal($environment)))
            ->orderBy($expr->asc('Category.orderNumber'))
            ->addOrderBy($expr->asc('Category.name'))
            ->getQuery()
            ->getResult();

        $result = [];
        if (count($buf) > 0) {
            foreach ($buf as $row) {
                $result[$row['id']] = $row['name'];
            }
        }

        return $result;
    }

    /**
     * @param string  $environment Environment name.
     * @param integer $orderNumber Current order number.
     *
     * @return integer
     */
    public function getPreviousOrderNumber($environment, $orderNumber)
    {
        $qb = $this->createQueryBuilder('Category');
        $expr = $qb->expr();

        try {
            $result = $qb
                ->select('Category.orderNumber')
                ->join('Category.environment', 'Environment')
                ->where(
                    $expr->andX(
                        $expr->eq('Environment.slug', $expr->literal($environment)),
                        $expr->lt('Category.orderNumber', $orderNumber)
                    )
                )
                ->orderBy($expr->desc('Category.orderNumber'))
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
        $qb = $this->createQueryBuilder('Category');
        $expr = $qb->expr();

        try {
            $result = $qb
                ->select('Category.orderNumber')
                ->join('Category.environment', 'Environment')
                ->where(
                    $expr->andX(
                        $expr->eq('Environment.slug', $expr->literal($environment)),
                        $expr->gt('Category.orderNumber', $orderNumber)
                    )
                )
                ->orderBy($expr->asc('Category.orderNumber'))
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
