<?php

namespace GovWiki\FrontendBundle\Twig;

use GovWiki\AdminBundle\Manager\AdminStyleManager;
use GovWiki\ApiBundle\Manager\EnvironmentManager;
use JMS\Serializer\Serializer;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\Routing\RouterInterface;

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
     * @param EnvironmentManager $manager A EnvironmentManager instance.
     */
    public function __construct(
        EnvironmentManager $manager,
        Serializer $serializer,
        $determinatorType,
        ContainerInterface $container
    ) {
        $this->manager = $manager;
        $this->serializer = $serializer;
        $this->determinatorType = $determinatorType;
        $this->container = $container;
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
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function getFunctions()
    {
        return [
            new \Twig_SimpleFunction('govwiki_path', [
                $this,
                'generateGovWikiPath',
            ]),
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function getGlobals()
    {
        $styles = $this->manager->getStyle();
        $styles = json_encode($styles);

//        $styles = AdminStyleManager::getDefaultStyles();
//       $styles = json_encode($styles);
        return [
            'styles' => $styles,
            'environment' => $this->manager->getEnvironment(),
            'environment_slug' => $this->manager->getSlug(),
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

    /**
     * @param       $route
     * @param array $parameters
     *
     * @return string
     */
    public function generateGovWikiPath($route, array $parameters = [])
    {
        if ('path' === $this->determinatorType) {
            $parameters = array_merge($parameters, [
                'environment' => $this->manager->getSlug(),
            ]);
        }

        $router = $this->container->get('router');
        return $router->generate($route, $parameters);
    }
}
