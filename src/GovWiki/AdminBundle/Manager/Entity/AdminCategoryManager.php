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
}
