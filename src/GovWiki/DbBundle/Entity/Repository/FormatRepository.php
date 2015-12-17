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
            ->getQuery();
    }

    /**
     * @param string $environment Environment name.
     *
     * @return Format[]
     */
    public function get($environment)
    {
        return $this->getListQuery($environment)
            ->getResult();
    }
}
