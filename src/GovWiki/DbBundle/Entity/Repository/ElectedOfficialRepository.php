<?php

namespace GovWiki\DbBundle\Entity\Repository;

use Doctrine\ORM\EntityRepository;
use GovWiki\DbBundle\Entity\ElectedOfficial;

/**
 * ElectedOfficialRepository
 */
class ElectedOfficialRepository extends EntityRepository
{
    /**
     * @param string  $environment Environment name.
     * @param integer $id          Elected official id.
     * @param string  $fullName    Elected official full name.
     * @param string  $government  Government name.
     *
     * @return \Doctrine\ORM\Query
     */
    public function getListQuery(
        $environment,
        $id = null,
        $fullName = null,
        $government = null
    ) {
        $qb = $this
            ->createQueryBuilder('eo')
            ->leftJoin('eo.government', 'Government')
            ->leftJoin('Government.environment', 'Environment');

        $expr = $qb->expr();

        $qb->where($expr->eq('Environment.name', $expr->literal($environment)));

        if (null !== $id) {
            $qb->andWhere($expr->eq('eo.id', $id));
        }
        if (null !== $fullName) {
            $qb->andWhere(
                $expr->like('eo.fullName', $expr->literal($fullName))
            );
        }
        if (null !== $government) {
            $qb->andWhere($expr->eq(
                'Government.name',
                $expr->literal($government)
            ));
        }

        return $qb->getQuery();
    }

    /**
     * Get elected officials by ids.
     *
     * @param array $ids Elected officials ids.
     *
     * @return array
     */
    public function getDataForEmailByIds(array $ids = [])
    {
        $qb = $this->createQueryBuilder('ElectedOfficial');
        return $qb
            ->select('
                ElectedOfficial.fullName,
                ElectedOfficial.title,
                ElectedOfficial.emailAddress,
                Government.name,
                Government.slug
            ')
            ->join('ElectedOfficial.government', 'Government')
            ->where(
                $qb->expr()->in('ElectedOfficial.id', $ids)
            )
            ->getQuery()
            ->getArrayResult();
    }
}
