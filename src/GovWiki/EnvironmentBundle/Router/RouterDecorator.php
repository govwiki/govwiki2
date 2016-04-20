<?php

namespace GovWiki\EnvironmentBundle\Router;

use GovWiki\EnvironmentBundle\Storage\EnvironmentStorageInterface;
use Symfony\Component\Routing\RequestContext;
use Symfony\Component\Routing\RouterInterface;

/**
 * Class RouterDecorator
 * @package GovWiki\EnvironmentBundle\Router
 */
class RouterDecorator implements RouterInterface
{

    /**
     * @var RouterInterface
     */
    private $router;

    /**
     * @var EnvironmentStorageInterface
     */
    private $storage;

    /**
     * @var string
     */
    private $determinatorName;

    /**
     * @param RouterInterface             $router           A RouterInterface
     *                                                      instance.
     * @param EnvironmentStorageInterface $storage          A EnvironmentStorageInterface
     *                                                      instance.
     * @param string                      $determinatorName Determinator name.
     */
    public function __construct(
        RouterInterface $router,
        EnvironmentStorageInterface $storage,
        $determinatorName
    ) {
        $this->router = $router;
        $this->storage = $storage;
        $this->determinatorName = $determinatorName;
    }

    /**
     * {@inheritdoc}
     */
    public function generate(
        $name,
        $parameters = [ ],
        $referenceType = self::ABSOLUTE_PATH
    ) {
        $collection = $this->router->getRouteCollection();
        $currentRoute = $collection->get($name);

        // Add environment to parameters only if it's really need.
        $needEnvironment = $currentRoute->hasRequirement('environment') &&
            (strpos($name, 'admin') === false);

        if (('path' === $this->determinatorName) && $needEnvironment) {
            $environment = $this->storage->get();

            if (null !== $environment) {
                $parameters = array_merge($parameters, [
                    'environment' => $this->storage->get()->getSlug(),
                ]);
            }
        }

        return $this->router->generate($name, $parameters, $referenceType);
    }

    /**
     * {@inheritdoc}
     */
    public function setContext(RequestContext $context)
    {
        $this->router->setContext($context);
    }

    /**
     * {@inheritdoc}
     */
    public function getContext()
    {
        return $this->router->getContext();
    }

    /**
     * {@inheritdoc}
     */
    public function getRouteCollection()
    {
        return $this->router->getRouteCollection();
    }

    /**
     * {@inheritdoc}
     */
    public function match($pathinfo)
    {
        return $this->router->match($pathinfo);
    }
}