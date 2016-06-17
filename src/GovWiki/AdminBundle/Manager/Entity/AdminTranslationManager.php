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
     * @param string  $locale        Locale short name ('en', 'fr' etc.).
     * @param array   $keySettings   Array with Matching type and
     *                               Translation Keys array
     * @param string  $translation   Translation text.
     * @param boolean $needOneResult If true, return object, else return
     *                               array.
     *
     * @return array
     */
    public function getGlobalTranslations(
        $locale,
        $keySettings = null,
        $translation = null,
        $needOneResult = false
    ) {
        /** @var TranslationRepository $repository */
        $repository = $this->getRepository();

        return $repository->getGlobalTranslations(
            $locale,
            $keySettings,
            $translation,
            $needOneResult
        );
    }

    /**
     * @param string  $locale        Locale short name ('en', 'fr' etc.).
     * @param array   $keySettings   Array with Matching type and
     *                               Translation Keys array
     * @param string  $translation   Translation text.
     * @param boolean $needOneResult If true, return object, else return
     *                               array.
     *
     * @return array
     */
    public function getEnvironmentTranslations(
        $locale,
        $keySettings = null,
        $translation = null,
        $needOneResult = false
    ) {
        /** @var TranslationRepository $repository */
        $repository = $this->getRepository();

        return $repository->getEnvironmentTranslations(
            $this->getEnvironment()->getId(),
            $locale,
            $keySettings,
            $translation,
            $needOneResult
        );
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
        return $repository->getTranslationsBySettings($this->getEnvironment()->getId(), $locale_name, $trans_key_settings, $translation, $needOneResult);
    }

    /**
     * @param string  $locale_name Locale short name ('en', 'fr' etc.)
     * @param boolean $getGlobal   Flag, if set return global trans info.
     *
     * @return array
     */
    public function getTransInfoByLocale($locale_name, $getGlobal = false)
    {
        /** @var TranslationRepository $repository */
        $repository = $this->getRepository();

        $environment = $this->getEnvironment()->getSlug();
        if ($getGlobal) {
            $environment = null;
        }

        return $repository->getTransInfoByLocale($environment, $locale_name);
    }

    /**
     * {@inheritdoc}
     */
    protected function getEntityClassName()
    {
        return 'GovWiki\DbBundle\Entity\Translation';
    }
}
