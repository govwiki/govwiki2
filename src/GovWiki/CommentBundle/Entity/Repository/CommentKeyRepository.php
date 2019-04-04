<?php

namespace GovWiki\CommentBundle\Entity\Repository;

use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\NonUniqueResultException;
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
    public function find($key, $lockMode = null, $lockVersion = null)
    {
        $qb = $this->createQueryBuilder('Key');
        $expr = $qb->expr();

        try {
            return $qb
                ->addSelect('Vote, ElectedOfficial, Legislation')
                ->join('Key.vote', 'Vote')
                ->join('Vote.electedOfficial', 'ElectedOfficial')
                ->join('Vote.legislation', 'Legislation')
                ->where($expr->eq('Key.key', $expr->literal($key)))
                ->getQuery()
                ->getOneOrNullResult();
        } catch (NonUniqueResultException $e) {
            return null;
        }
    }

    /**
     * @param string $key Generated key.
     *
     * @return void
     */
    public function remove($key)
    {
        $qb = $this->createQueryBuilder('Key');
        $expr= $qb->expr();

        $qb
            ->delete()
            ->where($expr->eq('Key.key', $expr->literal($key)))
            ->getQuery()
            ->execute();
    }
}
