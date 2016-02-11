<?php

namespace GovWiki\CommentBundle\Entity\Repository;

use Doctrine\ORM\EntityRepository;
use GovWiki\CommentBundle\Entity\CommentKey;

/**
 * CommentKeyRepository
 */
class CommentKeyRepository extends EntityRepository
{

    /**
     * @param string $key Generated key.
     *
     * @return CommentKey
     */
    public function findKey($key)
    {
        $qb = $this->createQueryBuilder('Key');
        $expr = $qb->expr();

        return $qb
            ->addSelect('Vote')
            ->join('Key.vote', 'Vote')
            ->where($expr->eq('Key.key', $expr->literal($key)))
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();
    }
}
