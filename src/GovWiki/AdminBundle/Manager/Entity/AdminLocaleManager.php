<?php

namespace GovWiki\AdminBundle\Manager\Entity;

use GovWiki\AdminBundle\Manager\AbstractAdminEntityManager;
use GovWiki\DbBundle\Entity\Repository\LocaleRepository;

/**
 * Class AdminGovernmentManager
 * @package GovWiki\AdminBundle\Manager
 */
class AdminLocaleManager extends AbstractAdminEntityManager
{
    /**
     * {@inheritdoc}
     */
    protected function getEntityClassName()
    {
        return 'GovWiki\DbBundle\Entity\Locale';
    }

    /**
     * @return array
     */
    public function getListLocaleNames()
    {
        /** @var LocaleRepository $repository */
        $repository = $this->getRepository();
        return $repository->getListLocaleNames($this->environment);
    }

    /**
     * @param string $shortName Locale shortName parameter
     *
     * @return \GovWiki\DbBundle\Entity\Locale
     */
    public function getOneLocaleByShortName($shortName)
    {
        /** @var LocaleRepository $repository */
        $repository = $this->getRepository();
        return $repository->getOneLocaleByShortName($this->environment, $shortName);
    }
}
