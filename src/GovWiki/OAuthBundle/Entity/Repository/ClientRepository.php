<?php

namespace GovWiki\OAuthBundle\Entity\Repository;

use Doctrine\ORM\EntityRepository;

/**
 * ClientRepository
 */
class ClientRepository extends EntityRepository
{
    /**
     * @return \Doctrine\ORM\Query
     */
    public function getListQuery()
    {
        return $this->createQueryBuilder('Client')
            ->getQuery();
    }
}
