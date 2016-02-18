<?php

namespace GovWiki\ApiBundle\Router;

use GovWiki\AdminBundle\Manager\AdminEnvironmentManager;
use Symfony\Component\Routing\RouterInterface;

/**
 * Class GovWikiUrlGenerator
 * @package GovWiki\ApiBundle\Router
 */
class GovWikiUrlGenerator
{

    /**
     * @var RouterInterface
     */
    private $router;

    /**
     * @var string
     */
    private $determinatorType;

    /**
     * @var string
     */
    private $environment;

    /**
     * @param RouterInterface $router           A RouterInterface instance.
     * @param string          $determinatorType Determinator type.
     */
    public function __construct(
        RouterInterface $router,
        $determinatorType,
        AdminEnvironmentManager $manager
    ) {
        $this->determinatorType = $determinatorType;
        $this->router = $router;
        $this->environment = $manager->getEnvironment();
    }

    /**
     * @param string $route      Route name.
     * @param array $parameters Route parameters.
     *
     * @return mixed
     */
    public function generate($route, array $parameters = [], $referenseType = RouterInterface::ABSOLUTE_PATH)
    {
        if ('path' === $this->determinatorType) {
            $parameters = array_merge($parameters, [
                'environment' => $this->environment,
            ]);
        }

        return $this->router->generate($route, $parameters, $referenseType);
    }
}
