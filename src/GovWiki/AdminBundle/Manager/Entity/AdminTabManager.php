<?php

namespace GovWiki\AdminBundle\Manager\Entity;

use GovWiki\AdminBundle\Manager\AbstractAdminEntityManager;
use GovWiki\DbBundle\Entity\Repository\TabRepository;
use GovWiki\DbBundle\Entity\Tab;

/**
 * Class AdminTabManager
 * @package GovWiki\AdminBundle\Manager
 */
class AdminTabManager extends AbstractAdminEntityManager
{
    /**
     * {@inheritdoc}
     */
    protected function getEntityClassName()
    {
        return 'GovWiki\DbBundle\Entity\Tab';
    }

    /**
     * @return \Doctrine\ORM\Query
     */
    public function getListQuery()
    {
        /** @var TabRepository $repository */
        $repository = $this->getRepository();

        return $repository->getListQuery($this->getEnvironment()->getSlug());
    }

    /**
     * @return Tab
     */
    public function create()
    {
        $tab = new Tab();
        $tab->setEnvironment($this->getEnvironment());

        return $tab;
    }
}
