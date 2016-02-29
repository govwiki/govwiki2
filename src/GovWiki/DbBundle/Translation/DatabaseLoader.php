<?php

namespace GovWiki\DbBundle\Translation;

use Doctrine\ORM\EntityManager;
use GovWiki\ApiBundle\Manager\EnvironmentManagerAwareInterface;
use Symfony\Component\Translation\Loader\LoaderInterface;
use Symfony\Component\Translation\MessageCatalogue;

/**
 * Class DatabaseLoader
 *
 * @uses Symfony\Component\Translation\Loader\LoaderInterface
 * @uses Symfony\Component\Translation\MessageCatalogue
 */
class DatabaseLoader implements LoaderInterface, EnvironmentManagerAwareInterface
{
    private $localeRepository;
    private $translationRepository;
    private $environment;

    /**
     * {@inheritdoc}
     */
    public function setEnvironment($environment)
    {
        if (('' === $environment) | ('admin' === $environment)) {
            return $this;
        }

        $this->environment = $environment;

        return $this;
    }

    /**
     * default constructor
     *
     * @param EntityManager $em
     */
    public function __construct(EntityManager $em)
    {
        $this->localeRepository = $em->getRepository("GovWikiDbBundle:Locale");
        $this->translationRepository = $em->getRepository("GovWikiDbBundle:Translation");
    }

    /**
     * load messages from db
     *
     * @param string $resource translation key
     * @param string $locale current locale
     * @param string $messageDomain message domain
     * @return \Symfony\Component\Translation\MessageCatalogue
     */
    public function load($resource, $locale, $messageDomain = 'messages')
    {
        // get our translations, obviously
        $translations = $this->translationRepository->getTranslationsBySettings($this->environment, $locale);

        $catalogue = new MessageCatalogue($locale);

        foreach ($translations as $translation) {
            $catalogue->set($translation->getTransKey(), $translation->getTranslation(), $messageDomain);
        }

        return $catalogue;
    }
}
