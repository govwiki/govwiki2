<?php

namespace GovWiki\FrontendBundle\Twig;

use GovWiki\ApiBundle\Manager\EnvironmentManager;
use GovWiki\EnvironmentBundle\GovWikiEnvironmentService;
use JMS\Serializer\Serializer;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\Translation\TranslatorInterface;
use Symfony\Component\Translation\MessageCatalogue;

/**
 * Class Extension
 * @package GovWiki\FrontendBundle\Twig
 */
class Extension extends \Twig_Extension
{

    /**
     * @var Serializer
     */
    private $serializer;

    /**
     * @var string
     */
    private $determinatorType;

    /**
     * @var ContainerInterface
     */
    private $container;

    /**
     * @var TranslatorInterface
     */
    private $translator;

    /**
     * @param EnvironmentManager $manager A EnvironmentManager instance.
     */
    public function __construct(
        Serializer $serializer,
        $determinatorType,
        ContainerInterface $container,
        TranslatorInterface $translator
    ) {
        $this->serializer = $serializer;
        $this->determinatorType = $determinatorType;
        $this->container = $container;
        $this->translator = $translator;
    }

    /**
     * {@inheritdoc}
     */
    public function getName()
    {
        return 'gov_wiki.frontend';
    }

    /**
     * {@inheritdoc}
     */
    public function getFilters()
    {

        return [
            new \Twig_SimpleFilter('applay_mask', [
                $this,
                'formatGovernmentValue',
            ]),

            new \Twig_SimpleFilter('display', [
                $this,
                'displayValue',
            ]),
        ];
    }

//    /**
//     * {@inheritdoc}
//     */
//    public function getGlobals()
//    {
//        $manager = $this->container->get('govwiki_api.manager.environment');
//
//        if ($manager->getEnvironment()) {
//            $styles = $manager->getEntity()->getStyle();
//
//            /** @var MessageCatalogue $catalogue */
//            $catalogue = $this->translator->getCatalogue();
//            $transKey = 'general.bottom_text';
//            if ($catalogue->has($transKey)) {
//                $bottomText = $this->translator->trans($transKey);
//            } else {
//                $bottomText = '';
//            }
//
//            return [
//                'styles' => $styles,
//                'environment' => $manager->getEnvironment(),
//                'environment_slug' => $manager->getSlug(),
//                'hasElectedOfficials' => $manager
//                        ->countElectedOfficials() > 0,
//                'title' => $manager->getTitle(),
//                'bottomText' => $bottomText,
//                'entity' => $manager->getEntity(),
//            ];
//        }
//
//        return [];
//    }


    /**
     * {@inheritdoc}
     */
    public function getTests()
    {
        return [
            new \Twig_SimpleTest('viewed', [
                $this,
                'isViewed',
            ]),
        ];
    }

    /**
     * @param array  $government A Government instance.
     * @param string $field      Field name.
     * @param array  $format     Format.
     *
     * @return string
     */
    public function formatGovernmentValue(array $government, $field, array $format)
    {
        $value = $government[$field];

        if (is_string($value)) {
            if ('' === $value || '0' === $value) {
                return null;
            }
        } elseif ((empty($value) || ($value === 0) || (($value > -0.0001) && ($value < 0.0001)))) {
            return null;
        }

        if (strlen($format['mask']) > 0) {
            $mask = $format['mask'];
            $prefix = '';
            $postfix = '';
            $decimal = 0;

            if ('$' === $mask[0]) {
                $prefix = '$';

                if ($value < 0) {
                    $value = abs($value);
                    $prefix = '-$';
                }
                $decimalStr = $mask;
                if (strpos($mask, ',') !== false) {
                    $decimalStr = explode(',', $mask)[1];
                }
                $decimal = strlen($decimalStr) - 1;
            } elseif (strpos($mask, '%') !== false) {
                $postfix = '%';

                /*
                 * todo Ahtung! Hardcoded!
                 */
                if ('float' === $format['type']) {
                    $value *= 100;
                }

                $decimalStr = $mask;
                if (strpos($mask, '.') !== false) {
                    $decimalStr = explode('.', $mask)[1];
                }
                $decimal = strlen($decimalStr) - 1;
            }

            $value = $prefix . number_format($value, $decimal) . $postfix;
        } elseif (! is_string($value)) {
            /*
             * Add thousands separator.
             */
            $value = number_format($value);
        }

        return $value;
    }

    /**
     * @param array $format     Field format.
     * @param array $government Government data.
     *
     * @return boolean
     */
    public function isViewed(array $format, array $government)
    {
        return in_array($government['altType'], $format['showIn'], true);
    }

    /**
     * @param mixed $value Value.
     *
     * @param mixed
     */
    public function displayValue($value)
    {
        if (is_string($value)) {
            if ($this->isUrl($value)) {
                return '<a href="' . $value . '">' . $this->fixValueSize($value) . '</a>';
            }

            return $this->fixValueSize($value);
        }

        return $value;
    }

    private function fixValueSize($value)
    {
        if (is_string($value) && strlen($value) > 25) {
            return mb_substr($value, 0, 19) . '...';
        }
        return $value;
    }

    /**
     * @param string $string String to test.
     *
     * @return boolean
     */
    private function isUrl($string)
    {
        return preg_match(
            '#(?:[Hh][Tt]{2}[Pp][Ss]?://)?((?:[Ww]{3})?\.[a-zA-Z0-9\.]+\.[a-zA-Z]{2,})#',
            $string
        );
    }
}
