<?php

namespace GovWiki\DbBundle\Entity\Repository;

use Doctrine\ORM\EntityRepository;

/**
 * VoteCommentRepository
 */
class VoteCommentRepository extends EntityRepository
{
    /**
     * @param integer $electedOfficial A ElectedOfficial entity id.
     *
     * @return \Doctrine\ORM\QueryBuilder
     */
    public function getListQuery($electedOfficial)
    {
        $expr = $this->_em->getExpressionBuilder();

        return $this->createQueryBuilder('VoteComment')
            ->addSelect('Vote, Legislation')
            ->join('VoteComment.subject', 'Vote')
            ->join('Vote.legislation', 'Legislation')
            ->where($expr->eq('VoteComment.elected', ':elected'))
            ->setParameter('elected', $electedOfficial);
    }
}
