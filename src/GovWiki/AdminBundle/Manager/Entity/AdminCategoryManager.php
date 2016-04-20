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

        return $repository->getListQuery($this->getEnvironment()->getSlug());
    }

    /**
     * @return Category
     */
    public function create()
    {
        $tab = new Category();
        $tab->setEnvironment($this->getEnvironment());

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
            $this->getEnvironment()->getSlug(),
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
            $this->getEnvironment()->getSlug(),
            $tab->getOrderNumber()
        ));

        $this->update($tab);
    }
}
