<?php

namespace GovWiki\DbBundle\Entity\Repository;

use Doctrine\ORM\EntityRepository;

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
                'Format.id, Format.category, Format.field',
                'Format.description'
            )
            ->leftJoin('Format.map', 'Map')
            ->where($expr->eq('Map.name', $expr->literal($environment)))
            ->getQuery();
    }

    /**
     * @param string $environment Environment name.
     *
     * @return array
     */
    public function getCategories($environment)
    {
        $qb = $this->createQueryBuilder('Format');
        $expr = $qb->expr();

        $data = $qb
            ->select('Format.category')
            ->leftJoin('Format.map', 'Map')
            ->where($expr->eq('Map.name', $expr->literal($environment)))
            ->groupBy('Format.category')
            ->getQuery()
            ->getArrayResult();

        $result = [];
        foreach ($data as $row) {
            $result[$row['category']] = $row['category'];
        }

        return $result;
    }
}
