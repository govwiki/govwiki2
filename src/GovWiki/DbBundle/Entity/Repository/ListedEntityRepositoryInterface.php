<?php

namespace GovWiki\DbBundle\Entity\Repository;

/**
 * Interface ListedEntityRepositoryInterface
 * @package GovWiki\DbBundle\Entity\Repository
 */
interface ListedEntityRepositoryInterface
{
    /**
     * @param integer $electedOfficial Elected official entity id.
     * @param integer $user            User entity id.
     *
     * @return \Doctrine\ORM\QueryBuilder
     */
    public function getListQuery($electedOfficial, $user);

    /**
     * @param string $govAltTypeSlug Slugged government alt type.
     * @param string $govSlug        Slugged government name.
     * @param string $eoSlug         Slugged elected official name.
     * @param integer $user            User entity id.
     *
     * @return \Doctrine\ORM\QueryBuilder
     */
    public function getListQueryBySlugs($govAltTypeSlug, $govSlug, $eoSlug, $user = null);
}
