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
        return $repository->getListQuery($this->environment);
    }

    /**
     * @return Tab
     */
    public function create()
    {
        $tab = new Tab();
        $tab->setEnvironment($this->getEnvironmentReference());

        return $tab;
    }

    /**
     * @param Tab $tab A Tab instance.
     *
     * @return void
     */
    public function pullUp(Tab $tab)
    {
        /** @var TabRepository $repository */
        $repository = $this->getRepository();

        $tab->setOrderNumber($repository->getPreviousOrderNumber(
            $this->environment,
            $tab->getOrderNumber()
        ));

        $this->update($tab);
    }

    /**
     * @param Tab $tab A Tab instance.
     *
     * @return void
     */
    public function pullDown(Tab $tab)
    {
        /** @var TabRepository $repository */
        $repository = $this->getRepository();

        $tab->setOrderNumber($repository->getNextOrderNumber(
            $this->environment,
            $tab->getOrderNumber()
        ));

        $this->update($tab);
    }
}
