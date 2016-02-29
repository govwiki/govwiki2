<?php

namespace GovWiki\AdminBundle\Manager\Entity;

use GovWiki\AdminBundle\Manager\AbstractAdminEntityManager;
use GovWiki\DbBundle\Entity\Repository\TranslationRepository;

/**
 * Class AdminGovernmentManager
 * @package GovWiki\AdminBundle\Manager
 */
class AdminTranslationManager extends AbstractAdminEntityManager
{
    /**
     * {@inheritdoc}
     */
    protected function getEntityClassName()
    {
        return 'GovWiki\DbBundle\Entity\Translation';
    }

    /**
     * @param string $locale_name Locale short name ('en', 'fr' etc.)
     * @param array $trans_key_settings Array with Matching type and Translation Keys array
     * @param string $translation Translation text
     * @param boolean $needOneResult If true, return object, else return array.
     *
     * @return array
     */
    public function getTranslationsBySettings($locale_name = null, $trans_key_settings = null, $translation = null, $needOneResult = null)
    {
        /** @var TranslationRepository $repository */
        $repository = $this->getRepository();
        return $repository->getTranslationsBySettings($this->environment, $locale_name, $trans_key_settings, $translation, $needOneResult);
    }

    /**
     * @param string $locale_name Locale short name ('en', 'fr' etc.)
     *
     * @return array
     */
    public function getTransInfoByLocale($locale_name)
    {
        /** @var TranslationRepository $repository */
        $repository = $this->getRepository();
        return $repository->getTransInfoByLocale($this->environment, $locale_name);
    }
}
