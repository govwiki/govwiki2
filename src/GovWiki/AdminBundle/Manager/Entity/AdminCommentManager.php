<?php

namespace GovWiki\AdminBundle\Manager\Entity;

use GovWiki\AdminBundle\Manager\AbstractAdminEntityManager;
use GovWiki\DbBundle\Entity\Repository\VoteCommentRepository;

/**
 * Class AdminCommentManager
 * @package GovWiki\AdminBundle\Manager
 */
class AdminCommentManager extends AbstractAdminEntityManager
{
    /**
     * {@inheritdoc}
     */
    protected function getEntityClassName()
    {
        return 'GovWiki\CommentBundle\Entity\VoteComment';
    }

    /**
     * @param integer $elected A ElectedOfficial entity instance.
     *
     * @return \Doctrine\ORM\Query
     */
    public function getListQuery($elected)
    {
        /** @var VoteCommentRepository $repository */
        $repository = $this->getRepository();
        return $repository->getListQuery($elected);
    }
}
