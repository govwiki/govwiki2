<?php

namespace GovWiki\AdminBundle\Manager\Entity;

use GovWiki\AdminBundle\Manager\AbstractAdminEntityManager;
use GovWiki\DbBundle\Entity\Repository\ElectedOfficialRepository;

/**
 * Class AdminElectedOfficialManager
 * @package GovWiki\AdminBundle\Manager
 */
class AdminElectedOfficialManager extends AbstractAdminEntityManager
{
    /**
     * {@inheritdoc}
     */
    protected function getEntityClassName()
    {
        return 'GovWiki\DbBundle\Entity\ElectedOfficial';
    }

    /**
     * @param integer $id         Elected official id.
     * @param string  $fullName   Elected official full name.
     * @param string  $government Government name.
     *
     * @return \Doctrine\ORM\Query
     */
    public function getListQuery(
        $id = null,
        $fullName = null,
        $government = null
    ) {
        /** @var ElectedOfficialRepository $repository */
        $repository = $this->getRepository();
        return $repository->getListQuery(
            $this->environment,
            $id,
            $fullName,
            $government
        );
    }
}
