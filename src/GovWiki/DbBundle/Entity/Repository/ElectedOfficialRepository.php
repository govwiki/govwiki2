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
