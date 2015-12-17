<?php

namespace GovWiki\DbBundle\Entity\Repository;

use Doctrine\ORM\EntityRepository;
use GovWiki\DbBundle\Entity\Format;

/**
 * FormatRepository
 */
class FormatRepository extends EntityRepository
{
    /**
     * @param string $environment Environment name.
     *
     * @return \Doctrine\ORM\Query
     */
    public function getListQuery($environment)
    {
        $qb = $this->createQueryBuilder('Format');
        $expr = $qb->expr();

        return $qb
            ->select(
                'Format.id, Format.field, Format.description',
                'Tab.name AS tab_name, Category.name AS category_name'
            )
            ->leftJoin('Format.environment', 'Environment')
            ->leftJoin('Format.category', 'Category')
            ->leftJoin('Format.tab', 'Tab')
            ->where($expr->eq('Environment.name', $expr->literal($environment)))
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
    public function get($environment)
    {
        $result = $this->getListQuery($environment)
            ->getArrayResult();
        return $this->groupBy($result, [ 'tab_name', 'category_name' ]);
    }

    /**
     * @param array $array
     * @param array $fields
     *
     * @return array
     */
    private function groupBy(array $array, array $fields)
    {
        $fieldName = array_shift($fields);

        $count = count($array);
        /*
         * Group up until there is a field to group.
         */
        if (($count > 0) && (null !== $fieldName)) {
            /*
             * Move first element to new group.
             */
            $current = $this->getGroupValue($array, $fieldName);

            unset($array[0][$fieldName]);
            $tmp[$current][] = $array[0];

            for ($i = 1; $i < $count; ++$i) {
                if ($array[$i][$fieldName] !== $current) {
                    $tmp[$current] = $this->groupBy($tmp[$current], $fields);
                    $current = $this->getGroupValue($array, $fieldName, $i);
                }

                /*
                 * Move element to current group.
                 */
                unset($array[$i][$fieldName]);
                $tmp[$current][] = $array[$i];
            }
            $tmp[$current] = $this->groupBy($tmp[$current], $fields);
            $array = $tmp;
        }

        return $array;
    }

    /**
     * @param array   $array
     * @param string  $field
     * @param integer $index
     *
     * @return string
     */
    private function getGroupValue(array $array, $field, $index = 0)
    {
        $current = $array[$index][$field];
        if ($current instanceof \DateTime) {
            $current = $current->format('Y-m-d');
        }

        return $current;
    }
}
