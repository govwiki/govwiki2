<?php

namespace GovWiki\DbBundle\Translation;

use Doctrine\ORM\EntityManagerInterface;
use GovWiki\DbBundle\Entity\Environment;
use GovWiki\DbBundle\Entity\Repository\TranslationRepository;
use GovWiki\DbBundle\Entity\Translation;
use GovWiki\EnvironmentBundle\Storage\EnvironmentStorageInterface;
use Symfony\Component\Translation\MessageCatalogueInterface;
use Symfony\Component\Translation\TranslatorBagInterface;
use Symfony\Component\Translation\TranslatorInterface;

/**
 * Class GovwikiTranslator
 *
 * @package GovWiki\DbBundle\Translation
 */
class GovwikiTranslatorDecorator implements TranslatorInterface, TranslatorBagInterface
{

    /**
     * @var TranslatorInterface|TranslatorBagInterface
     */
    private $translator;

    /**
     * @var EnvironmentStorageInterface
     */
    private $environmentStorage;

    /**
     * @var TranslationRepository
     */
    private $repository;

    /**
     * @var string[]
     */
    private $dbTranslations;

    /**
     * GovwikiTranslatorDecorator constructor.
     *
     * @param TranslatorInterface         $translator         A TranslatorInterface
     *                                                        instance.
     * @param EnvironmentStorageInterface $environmentStorage A EnvironmentStorageInterface
     *                                                        instance.
     * @param TranslationRepository       $repository         A TranslationRepository
     *                                                        instance.
     */
    public function __construct(
        TranslatorInterface $translator,
        EnvironmentStorageInterface $environmentStorage,
        TranslationRepository $repository
    ) {
        if (!$translator instanceof TranslatorBagInterface) {
            throw new \InvalidArgumentException(\sprintf(
                'The Translator "%s" must implement TranslatorInterface and TranslatorBagInterface.',
                \get_class($translator)
            ));
        }

        $this->translator = $translator;
        $this->environmentStorage = $environmentStorage;
        $this->repository = $repository;
    }

    /**
     * Translates the given message.
     *
     * @param string      $id         The message id (may also be an object that can be cast to string).
     * @param array       $parameters An array of parameters for the message.
     * @param string|null $domain     The domain for the message or null to use the default.
     * @param string|null $locale     The locale or null to use the default.
     *
     * @return string The translated string
     *
     * @throws \InvalidArgumentException If the locale contains invalid characters.
     */
    public function trans($id, array $parameters = [], $domain = null, $locale = null)
    {
        $trans = $this->translator->trans($id, $parameters, $domain, $locale);

        //
        // Try to resolve translation from database if not found in catalogues.
        // We not use custom loader 'cause it not work properly and require form
        // us creating dummy files which is not good.
        //
        if ($trans === $id) {
            $trans = $this->dbTrans($id, $locale);
        }

        return $trans;
    }

    /**
     * Translates the given choice message by choosing a translation according
     * to a number.
     *
     * @param string      $id         The message id (may also be an object
     *                                that can be cast to string).
     * @param integer     $number     The number to use to find the indice of
     *                                the message.
     * @param array       $parameters An array of parameters for the message.
     * @param string|null $domain     The domain for the message or null to use
     *                                the default.
     * @param string|null $locale     The locale or null to use the default.
     *
     * @return string The translated string.
     *
     * @throws \InvalidArgumentException If the locale contains invalid
     *                                   characters.
     */
    public function transChoice($id, $number, array $parameters = [], $domain = null, $locale = null): string
    {
        return $this->translator->transChoice($id, $number, $parameters, $domain, $locale);
    }

    /**
     * Sets the current locale.
     *
     * @param string $locale The locale.
     *
     * @throws \InvalidArgumentException If the locale contains invalid
     *                                   characters.
     */
    public function setLocale($locale)
    {
        $this->translator->setLocale($locale);
    }

    /**
     * Returns the current locale.
     *
     * @return string The locale.
     */
    public function getLocale(): string
    {
        return $this->translator->getLocale();
    }

    /**
     * Gets the catalogue by locale.
     *
     * @param string|null $locale The locale or null to use the default.
     *
     * @return MessageCatalogueInterface
     *
     * @throws \InvalidArgumentException If the locale contains invalid
     *                                   characters.
     */
    public function getCatalogue($locale = null): MessageCatalogueInterface
    {
        return $this->translator->getCatalogue($locale);
    }

    /**
     * @param string      $id     Translation id.
     * @param string|null $locale Requested locale.
     *
     * @return string
     */
    private function dbTrans(string $id, string $locale = null): string
    {
        if ($this->dbTranslations === null) {
            $environment = $this->environmentStorage->get();

            if ($environment !== null) {
                $tmp = $this->repository->getAllTranslations(
                    $environment->getId(),
                    $locale ?? $this->getLocale()
                );

                foreach ($tmp as $data) {
                    $this->dbTranslations[$data['transKey']] = $data['translation'];
                }
            } else {
                $this->dbTranslations = [];
            }
        }

        return $this->dbTranslations[$id] ?? $id;
    }
}
