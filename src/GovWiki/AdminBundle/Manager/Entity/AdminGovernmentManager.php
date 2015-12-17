<?php

namespace GovWiki\AdminBundle\Manager\Entity;

use GovWiki\AdminBundle\Manager\AbstractAdminEntityManager;
use GovWiki\DbBundle\Entity\Government;
use GovWiki\DbBundle\Entity\Repository\GovernmentRepository;

/**
 * Class AdminGovernmentManager
 * @package GovWiki\AdminBundle\Manager
 */
class AdminGovernmentManager extends AbstractAdminEntityManager
{
    /**
     * {@inheritdoc}
     */
    protected function getEntityClassName()
    {
        return 'GovWiki\DbBundle\Entity\Government';
    }

    /**
     * @param integer $id   Government id.
     * @param string  $name Government name.
     *
     * @return \Doctrine\ORM\Query
     */
    public function getListQuery($id = null, $name = null)
    {
        /** @var GovernmentRepository $repository */
        $repository = $this->getRepository();
        return $repository->getListQuery($this->environment, $id, $name);
    }

    /**
     * @return \GovWiki\DbBundle\Entity\Government
     */
    public function create()
    {
        /** @var Government $government */
        $government = parent::create();
        return $government->setEnvironment($this->getEnvironmentReference());
    }
}
