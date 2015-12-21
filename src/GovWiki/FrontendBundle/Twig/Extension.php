<?php

namespace GovWiki\FrontendBundle\Twig;

use GovWiki\ApiBundle\Manager\EnvironmentManager;

/**
 * Class Extension
 * @package GovWiki\FrontendBundle\Twig
 */
class Extension extends \Twig_Extension
{
    /**
     * @var EnvironmentManager
     */
    private $manager;

    /**
     * @param EnvironmentManager $manager A EnvironmentManager instance.
     */
    public function __construct(EnvironmentManager $manager)
    {
        $this->manager = $manager;
    }

    /**
     * {@inheritdoc}
     */
    public function getName()
    {
        return 'frontend';
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
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function getGlobals()
    {
        return [
            'styles' => $this->manager->getStyle(),
        ];
    }


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
        if (strlen($format['mask']) > 0) {
            /*
             * Current value has mask.
             */
            $mask = $format['mask'];

            $prefix = '';
            $postfix = '';
            $decimal = 1;

            if ('$' === $mask[0]) {
                $prefix = '$';

                /*
                 * Compute number of decimal point.
                 */
                $decimalStr = $mask;
                if (strpos($mask, ',') !== false) {
                    $decimalStr = explode(',', $mask)[1];
                }
                $decimal = strlen($decimalStr) - 1;
            } elseif (strpos($mask, '%') !== false) {
                $postfix = '%';

                /*
                 * Compute number of decimal point.
                 */
                $decimalStr = $mask;
                if (strpos($mask, '.') !== false) {
                    $decimalStr = explode('.', $mask)[1];
                }
                $decimal = strlen($decimalStr) - 1;
            }

            $value = $prefix . number_format($value, $decimal) . $postfix;
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
}
