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
}
