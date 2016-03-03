<?php

namespace GovWiki\DbBundle\Entity\Repository;

use Doctrine\ORM\EntityRepository;
use GovWiki\DbBundle\Utils\Functions;

/**
 * FormatRepository
 */
class FormatRepository extends EntityRepository
{
    /**
     * @param string  $environment Environment name.
     * @param boolean $full        Flag.
     *
     * @return \Doctrine\ORM\Query
     */
    public function getListQuery($environment, $full = false)
    {
        $qb = $this->createQueryBuilder('Format');
        $expr = $qb->expr();

        if ($full) {
            $qb->select(
                'Format.helpText, Format.dataOrFormula, Format.name',
                'Format.mask, Format.field, Format.ranked, Format.showIn',
                'Format.type'
            );
        } else {
            $qb->select('Format.id, Format.name');
        }

        return $qb
            ->addSelect(
                'Tab.id AS tab_id, Tab.name AS tab_name, Category.id AS category_id, Category.name AS category_name',
                'Category.decoration as category_decoration'
            )
            ->leftJoin('Format.environment', 'Environment')
            ->leftJoin('Format.category', 'Category')
            ->leftJoin('Format.tab', 'Tab')
            ->where($expr->eq('Environment.slug', $expr->literal($environment)))
            ->orderBy($expr->asc('Tab.orderNumber'))
            ->addOrderBy($expr->asc('Tab.name'))
            ->addOrderBy($expr->asc('Category.orderNumber'))
            ->addOrderBy($expr->asc('Category.name'))
            ->getQuery();
    }

    /**
     * @param string $environment Environment name.
     *
     * @return array
     */
    public function getRankedFields($environment)
    {
        $qb = $this->createQueryBuilder('Format');
        $expr = $qb->expr();

        return $qb
            ->select('Format.field')
            ->leftJoin('Format.environment', 'Environment')
            ->where($expr->andX(
                $expr->eq('Environment.slug', $expr->literal($environment)),
                $expr->eq('Format.ranked', 1)
            ))
            ->getQuery()
            ->getArrayResult();
    }

    /**
     * @param string  $environment Environment name.
     * @param boolean $plain       Flag, if set return plain array without
     *                             grouping by tab names and fields.
     *
     * @return array
     */
    public function get($environment, $plain = false)
    {
        $result = $this->getListQuery($environment, true)
            ->getArrayResult();

        if ($plain) {
            return $result;
        }
        return Functions::groupBy($result, [ 'tab_name', 'field' ]);
    }

    /**
     * @param string $environment Environment name.
     * @param string $name        Field name.
     *
     * @return array|null
     */
    public function getOne($environment, $name)
    {
        $qb = $this->createQueryBuilder('Format');
        $expr = $qb->expr();

        $qb->select(
            'Format.helpText, Format.dataOrFormula, Format.name',
            'Format.mask, Format.field, Format.ranked, Format.showIn',
            'Format.type'
        );
        $result = $qb
            ->addSelect(
                'Tab.id AS tab_id, Tab.name AS tab_name, Category.id AS category_id, Category.name AS category_name',
                'Category.decoration as category_decoration'
            )
            ->leftJoin('Format.environment', 'Environment')
            ->leftJoin('Format.category', 'Category')
            ->leftJoin('Format.tab', 'Tab')
            ->where($expr->andX(
                $expr->eq('Environment.slug', $expr->literal($environment)),
                $expr->eq('Format.field', $expr->literal($name))
            ))
            ->getQuery()
            ->getArrayResult();

        if (is_array($result)) {
            return $result[0];
        }

        return null;
    }
}
