<?php

namespace GovWiki\DbBundle\Entity\Repository;

use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\NonUniqueResultException;
use GovWiki\DbBundle\Entity\Format;
use GovWiki\DbBundle\Utils\Functions;

/**
 * FormatRepository
 */
class FormatRepository extends EntityRepository
{

    /**
     * @param integer $environment Environment entity id.
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
                'Format.type, Format.rankType, Format.rankLetterRanges',
                'Format.source'
            );
        } else {
            $qb->select('Format.id, Format.name');
        }

        return $qb
            ->addSelect(
                'Tab.id AS tab_id, Tab.name AS tab_name',
                'Category.id AS category_id, Category.name AS category_name',
                'Category.decoration as category_decoration'
            )
            ->join('Format.category', 'Category')
            ->join('Category.tab', 'Tab')
            ->where($expr->eq('Format.environment', ':environment'))
            ->setParameter('environment', $environment)
            ->orderBy($expr->asc('Tab.orderNumber'))
            ->addOrderBy($expr->asc('Tab.name'))
            ->addOrderBy($expr->asc('Category.orderNumber'))
            ->addOrderBy($expr->asc('Category.name'))
            ->getQuery();
    }

    /**
     * @param integer $environment A Environment entity id.
     *
     * @return array
     */
    public function getRankedFields($environment)
    {
        $expr = $this->_em->getExpressionBuilder();

        return $this->createQueryBuilder('Format')
            ->select('Format.field')
            ->where($expr->andX(
                $expr->eq('Format.environment', ':environment'),
                $expr->eq('Format.ranked', 1)
            ))
            ->setParameter('environment', $environment)
            ->getQuery()
            ->getArrayResult();
    }

    /**
     * @param integer $environment Environment entity id.
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
     * @param integer $environment Environment entity id.
     * @param string  $name        Field name.
     * @param boolean $asObject    If set get entity instance instead of
     *                             array.
     *
     * @return array|Format|null
     */
    public function getOne($environment, $name, $asObject = false)
    {
        $expr = $this->_em->getExpressionBuilder();
        $qb = $this->createQueryBuilder('Format');

        if ($asObject) {
            $qb->addSelect('Category');
        } else {
            $qb->select(
                'Format.helpText, Format.dataOrFormula, Format.name',
                'Format.mask, Format.field, Format.ranked, Format.showIn',
                'Format.type',
                'Category.id AS category_id, Category.name AS category_name',
                'Category.decoration as category_decoration'
            );
        }

        try {
            return $qb
                ->leftJoin('Format.category', 'Category')
                ->where($expr->andX(
                    $expr->eq('Format.environment', ':environment'),
                    $expr->eq('Format.field', ':name')
                ))
                ->setParameters([
                    'environment' => $environment,
                    'name'        => $name,
                ])
                ->getQuery()
                ->getOneOrNullResult();
        } catch (NonUniqueResultException $e) {
            dump($e);
            return null;
        }
    }

    /**
     * @param integer     $environment Environment entity id.
     * @param string|null $altType     If set get only formats show only in
     *                                 specified government alt type.
     *
     * @return array
     */
    public function getList($environment, $altType = null)
    {
        $result = $this->get($environment, true);

        if (null !== $altType) {
            // Remove formats not show in specified alt type.
            $tmp = [];
            foreach ($result as $format) {
                if (in_array($altType, $format['showIn'], true)) {
                    $tmp[] = $format;
                }
            }

            $result = $tmp;
        }

        return $result;
    }
}
