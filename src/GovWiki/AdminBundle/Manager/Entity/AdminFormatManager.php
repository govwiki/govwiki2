<?php

namespace GovWiki\AdminBundle\Manager\Entity;

use GovWiki\AdminBundle\Manager\AbstractAdminEntityManager;
use GovWiki\DbBundle\Entity\Category;
use GovWiki\DbBundle\Entity\Format;
use GovWiki\DbBundle\Entity\Repository\FormatRepository;
use GovWiki\DbBundle\Entity\Tab;

/**
 * Class AdminFormatManager
 * @package GovWiki\AdminBundle\Manager
 */
class AdminFormatManager extends AbstractAdminEntityManager
{
    /**
     * {@inheritdoc}
     */
    protected function getEntityClassName()
    {
        return 'GovWiki\DbBundle\Entity\Format';
    }

    /**
     * @return \Doctrine\ORM\Query
     */
    public function getListQuery()
    {
        /** @var FormatRepository $repository */
        $repository = $this->getRepository();
        return $repository->getListQuery($this->environment);
    }

    /**
     * @return Format
     */
    public function create()
    {
        /** @var Format $format */
        $format = parent::create();
        return $format->setEnvironment($this->getEnvironmentReference());
    }

    /**
     * @return Tab
     */
    public function createTab()
    {
        $tab = new Tab();
        $tab->setEnvironment($this->getEnvironmentReference());

        return $tab;
    }

    /**
     * @return Category
     */
    public function createCategory()
    {
        $category = new Category();
        $category->setEnvironment($this->getEnvironmentReference());

        return $category;
    }
}
