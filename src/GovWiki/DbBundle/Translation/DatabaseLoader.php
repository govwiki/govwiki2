<?php

namespace GovWiki\DbBundle\Translation;

use Doctrine\ORM\EntityManagerInterface;
use GovWiki\DbBundle\Entity\Environment;
use GovWiki\EnvironmentBundle\Storage\EnvironmentStorageInterface;
use Symfony\Component\Translation\Loader\LoaderInterface;
use Symfony\Component\Translation\MessageCatalogue;

/**
 * Class DatabaseLoader
 *
 * @uses Symfony\Component\Translation\Loader\LoaderInterface
 * @uses Symfony\Component\Translation\MessageCatalogue
 */
class DatabaseLoader implements LoaderInterface
{
    private $localeRepository;
    private $translationRepository;
    private $environment;

    /**
     * default constructor
     *
     * @param EntityManagerInterface      $em      A EntityManagerInterface
     *                                             instance.
     * @param EnvironmentStorageInterface $storage A Environment entity instance.
     */
    public function __construct(
        EntityManagerInterface $em,
        EnvironmentStorageInterface $storage
    ) {
        $this->localeRepository = $em->getRepository("GovWikiDbBundle:Locale");
        $this->translationRepository = $em->getRepository("GovWikiDbBundle:Translation");
        $this->environment = $storage->get();
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
        $catalogue = new MessageCatalogue($locale);

        if ($this->environment) {
            // get our translations, obviously
            $translations = $this->translationRepository
                ->getAllTranslations($this->environment->getId(), $locale);

            foreach ($translations as $translation) {
                $catalogue->set($translation->getTransKey(), $translation->getTranslation(), $messageDomain);
            }
        }

        return $catalogue;
    }
}
