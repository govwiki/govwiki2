<?php

namespace GovWiki\FrontendBundle\Twig;

/**
 * Class Extension
 * @package GovWiki\FrontendBundle\Twig
 */
class Extension extends \Twig_Extension
{

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
    public function formatGovernmentValue(array $government, array $format)
    {
        $value = $government[$format['field']];

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

                // If type is float then this value is percent value :-)
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
            // Add thousands separator.
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
     * @return mixed
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

    /**
     * @param string $value String value to trim it.
     *
     * @return string
     */
    private function fixValueSize($value)
    {
        if (is_string($value) && strlen($value) > 25) {
            return mb_substr($value, 0, 19) .'...';
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
        return filter_var(trim($string), FILTER_VALIDATE_URL);
    }
}
