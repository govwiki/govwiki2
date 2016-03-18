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
        return 'GovWiki\DbBundle\Entity\AbstractLocale';
    }

    /**
     * @return array
     */
    public function getListLocales($global = false)
    {
        /** @var LocaleRepository $repository */
        $repository = $this->getRepository();

        $environment = $this->environment;
        if ($global) {
            $environment = null;
        }

        return $repository->getListLocales($environment);
    }

    /**
     * @return array
     */
    public function getListLocaleNames($global = false)
    {
        /** @var LocaleRepository $repository */
        $repository = $this->getRepository();

        $environment = $this->environment;
        if ($global) {
            $environment = null;
        }

        return $repository->getListLocaleNames($environment);
    }

    /**
     * @param string $shortName Locale shortName parameter
     *
     * @return \GovWiki\DbBundle\Entity\Locale
     */
    public function getOneLocaleByShortName($shortName, $global = false)
    {
        /** @var LocaleRepository $repository */
        $repository = $this->getRepository();

        $environment = $this->environment;
        if ($global) {
            $environment = null;
        }

        return $repository->getOneLocaleByShortName($environment, $shortName);
    }
}
