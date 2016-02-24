<?php

namespace GovWiki\DbBundle\Entity\Repository;

use Doctrine\ORM\EntityRepository;

/**
 * ShapeRepository
 */
class ShapeRepository extends EntityRepository
{

    /**
     * Get all available shapes.
     *
     * @return array|null
     */
    public function getList()
    {
        return $this->createQueryBuilder('Shape')
            ->select('Shape.name, Shape.id')
            ->getQuery()
            ->getArrayResult();
    }
}
