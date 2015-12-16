<?php

namespace GovWiki\AdminBundle\Manager\Entity;

use GovWiki\AdminBundle\Manager\AbstractAdminEntityManager;
use GovWiki\DbBundle\Entity\Government;
use GovWiki\DbBundle\Entity\Repository\CreateRequestRepository;

/**
 * Class AdminCreateRequestManager
 * @package GovWiki\AdminBundle\Manager
 */
class AdminCreateRequestManager extends AbstractAdminEntityManager
{
    /**
     * {@inheritdoc}
     */
    protected function getEntityClassName()
    {
        return 'GovWiki\DbBundle\Entity\CreateRequest';
    }

    /**
     * @return \Doctrine\ORM\Query
     */
    public function getListQuery()
    {
        /** @var CreateRequestRepository $repository */
        $repository = $this->getRepository();
        return $repository->getListQuery($this->environment);
    }
}
