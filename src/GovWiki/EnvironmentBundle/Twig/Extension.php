<?php

namespace GovWiki\EnvironmentBundle\Twig;

use GovWiki\EnvironmentBundle\Manager\Environment\EnvironmentManagerInterface;
use Symfony\Component\Translation\TranslatorInterface;
use Symfony\Component\Translation\MessageCatalogue;

/**
 * Class Extension
 * @package GovWiki\EnvironmentBundle\Twig
 */
class Extension extends \Twig_Extension
{

    /**
     * @var EnvironmentManagerInterface
     */
    private $environmentManager;

    /**
     * @var TranslatorInterface
     */
    private $translator;

    /**
     * @param EnvironmentManagerInterface $environmentManager A
     *                                                        EnvironmentManagerInterface
     *                                                        instance.
     */
    public function __construct(
        EnvironmentManagerInterface $environmentManager,
        TranslatorInterface $translator
    ) {
        $this->environmentManager = $environmentManager;
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
        $environment = $this->environmentManager->getEnvironment();

        /** @var MessageCatalogue $catalogue */
        $transKey = 'general.bottom_text';
        $bottomText = $this->translator->trans($transKey);
        if ($transKey === $bottomText) {
            $bottomText = '';
        }

        return [
            'environment' => $environment,
            'bottomText' => $bottomText,
            'hasElectedOfficials' => $this->environmentManager
                ->computeElectedOfficialsCount() > 0,
        ];
    }
}
