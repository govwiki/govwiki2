<?php

namespace GovWiki\FrontendBundle\Twig;

use GovWiki\DbBundle\Entity\Format;
use GovWiki\DbBundle\Entity\Government;
use Symfony\Component\Templating\EngineInterface;

/**
 * Class Extension
 * @package GovWiki\FrontendBundle\Twig
 */
class Extension extends \Twig_Extension
{
    /**
     * @var EngineInterface
     */
    private $templating;

    /**
     * @param EngineInterface $templating A EngineInterface instance.
     */
    public function __construct(EngineInterface $templating)
    {
        $this->templating = $templating;
    }

    /**
     * {@inheritdoc}
     */
    public function getName()
    {
        return 'frontend';
    }

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
     * @param Government $government
     * @param Format     $format
     *
     * @return string
     */
    public function formatGovernmentField(Government $government, array $format)
    {
        return call_user_func(
            [
                $government,
                'get'. ucfirst($format['field']),
            ]
        );
    }
}
