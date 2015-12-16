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
                'Format.id, Format.category, Format.field',
                'Format.description'
            )
            ->leftJoin('Format.environment', 'Environment')
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
