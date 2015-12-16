<?php

namespace GovWiki\AdminBundle\Manager\Entity;

use GovWiki\AdminBundle\Manager\AbstractAdminEntityManager;
use GovWiki\DbBundle\Entity\Repository\EditRequestRepository;

/**
 * Class AdminEditRequestManager
 * @package GovWiki\AdminBundle\Manager
 */
class AdminEditRequestManager extends AbstractAdminEntityManager
{
    /**
     * {@inheritdoc}
     */
    protected function getEntityClassName()
    {
        return 'GovWiki\DbBundle\Entity\EditRequest';
    }

    /**
     * @return \Doctrine\ORM\Query
     */
    public function getListQuery()
    {
        /** @var EditRequestRepository $repository */
        $repository = $this->getRepository();
        return $repository->getListQuery($this->environment);
    }
}
