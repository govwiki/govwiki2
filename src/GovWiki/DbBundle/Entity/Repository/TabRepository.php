<?php

namespace GovWiki\DbBundle\Entity\Repository;

use Doctrine\ORM\EntityRepository;
use GovWiki\DbBundle\Entity\Format;

/**
 * TabRepository
 */
class TabRepository extends EntityRepository
{
    /**
     * @param string $environment Environment name.
     *
     * @return array
     */
    public function getNames($environment)
    {
        $qb = $this->createQueryBuilder('Tab');
        $expr = $qb->expr();

        $buf = $qb
            ->select('Tab.name, Tab.id')
            ->innerJoin('Tab.environment', 'Environment')
            ->where($expr->eq('Environment.name', $expr->literal($environment)))
            ->orderBy($expr->asc('Tab.orderNumber'))
            ->addOrderBy($expr->asc('Tab.name'))
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
}
