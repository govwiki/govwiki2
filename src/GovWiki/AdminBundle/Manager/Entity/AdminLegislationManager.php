<?php

namespace GovWiki\AdminBundle\Manager\Entity;

use GovWiki\AdminBundle\Manager\AbstractAdminEntityManager;
use GovWiki\DbBundle\Entity\Repository\LegislationRepository;

/**
 * Class AdminLegislationManager
 * @package GovWiki\AdminBundle\Manager
 */
class AdminLegislationManager extends AbstractAdminEntityManager
{
    /**
     * {@inheritdoc}
     */
    protected function getEntityClassName()
    {
        return 'GovWiki\DbBundle\Entity\Legislation';
    }

    /**
     * @return \Doctrine\ORM\Query
     */
    public function getListQuery()
    {
        /** @var LegislationRepository $repository */
        $repository = $this->getRepository();
        return $repository->getListQuery($this->environment);
    }
}
