<?php

namespace GovWiki\AdminBundle\Manager\Entity;

use GovWiki\AdminBundle\Manager\AbstractAdminEntityManager;
use GovWiki\DbBundle\Entity\Repository\CategoryRepository;
use GovWiki\DbBundle\Entity\Category;

/**
 * Class AdminCategoryManager
 * @package GovWiki\AdminBundle\Manager
 */
class AdminCategoryManager extends AbstractAdminEntityManager
{
    /**
     * {@inheritdoc}
     */
    protected function getEntityClassName()
    {
        return 'GovWiki\DbBundle\Entity\Category';
    }

    /**
     * @return \Doctrine\ORM\Query
     */
    public function getListQuery()
    {
        /** @var CategoryRepository $repository */
        $repository = $this->getRepository();
        return $repository->getListQuery($this->environment);
    }

    /**
     * @return Category
     */
    public function create()
    {
        $tab = new Category();
        $tab->setEnvironment($this->getEnvironmentReference());

        return $tab;
    }

    /**
     * @param Category $tab A Category instance.
     *
     * @return void
     */
    public function pullUp(Category $tab)
    {
        /** @var CategoryRepository $repository */
        $repository = $this->getRepository();

        $tab->setOrderNumber($repository->getPreviousOrderNumber(
            $this->environment,
            $tab->getOrderNumber()
        ));

        $this->update($tab);
    }

    /**
     * @param Category $tab A Category instance.
     *
     * @return void
     */
    public function pullDown(Category $tab)
    {
        /** @var CategoryRepository $repository */
        $repository = $this->getRepository();

        $tab->setOrderNumber($repository->getNextOrderNumber(
            $this->environment,
            $tab->getOrderNumber()
        ));

        $this->update($tab);
    }
}
