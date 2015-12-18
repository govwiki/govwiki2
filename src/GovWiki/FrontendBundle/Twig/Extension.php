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
        return 'frontend';
    }

    /**
     * {@inheritdoc}
     */
    public function getFilters()
    {
        return [
            new \Twig_SimpleFilter('format_field', [
                $this,
                'formatGovernmentField',
            ]),
        ];
    }

    /**
     * @param array  $government A Government instance.
     * @param string $key        Extract from government by key.
     * @param array  $format     Format.
     *
     * @return string
     */
    public function formatGovernmentField(array $government, $key, array $format)
    {
        return $government[$key];
    }
}
