<?php

namespace GovWiki\FrontendBundle\Twig;

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

    public function getFunctions()
    {
        return [
            new \Twig_SimpleFunction('render_body', [ $this, 'renderBody' ]),
        ];
    }

    /**
     * @param array  $map  Map parameters.
     * @param string $body Body text.
     *
     * @return string
     */
    public function renderBody(array $map, $body)
    {
        return $this->templating->render(
            '@GovWikiFrontend/Partial/horizontal.html.twig',
            [
                'width'  => $map['width'],
                'height' => $map['height'],
                'body'   => $body,
            ]
        );
    }
}
