<?php

namespace GovWiki\EnvironmentBundle\Twig;

use GovWiki\EnvironmentBundle\Manager\ElectedOfficial\ElectedOfficialManagerInterface;
use GovWiki\EnvironmentBundle\Storage\EnvironmentStorageInterface;
use Symfony\Component\Translation\TranslatorInterface;
use Symfony\Component\Translation\MessageCatalogue;

/**
 * Class Extension
 * @package GovWiki\EnvironmentBundle\Twig
 */
class Extension extends \Twig_Extension
{

    /**
     * @var EnvironmentStorageInterface
     */
    private $storage;

    /**
     * @var ElectedOfficialManagerInterface
     */
    private $electedOfficialManager;

    /**
     * @var TranslatorInterface
     */
    private $translator;

    /**
     * @param EnvironmentStorageInterface     $storage                A
     *                                                                EnvironmentStorageInterface
     *                                                                instance.
     * @param ElectedOfficialManagerInterface $electedOfficialManager A
     *                                                                ElectedOfficialManagerInterface
     *                                                                instance.
     * @param TranslatorInterface             $translator             A
     *                                                                TranslatorInterface
     *                                                                instance.
     */
    public function __construct(
        EnvironmentStorageInterface $storage,
        ElectedOfficialManagerInterface $electedOfficialManager,
        TranslatorInterface $translator
    ) {
        $this->storage = $storage;
        $this->electedOfficialManager = $electedOfficialManager;
        $this->translator = $translator;
    }

    /**
     * {@inheritdoc}
     */
    public function getName()
    {
        return 'govwiki_environment';
    }

    /**
     * {@inheritdoc}
     */
    public function getGlobals()
    {
        $environment = $this->storage->get();

        /** @var MessageCatalogue $catalogue */
        $transKey = 'general.bottom_text';
        $bottomText = $this->translator->trans($transKey);
        if ($transKey === $bottomText) {
            $bottomText = '';
        }

        return [
            'environment' => $environment,
            'bottomText' => $bottomText,
            'hasElectedOfficials' => $this->electedOfficialManager
                ->computeElectedOfficialsCount($environment) > 0,
        ];
    }
}
