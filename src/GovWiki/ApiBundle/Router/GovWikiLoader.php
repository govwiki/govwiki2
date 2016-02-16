<?php

namespace GovWiki\ApiBundle\Router;

use Symfony\Component\Config\FileLocatorInterface;
use Symfony\Component\Config\Resource\FileResource;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Loader\AnnotationClassLoader;
use Symfony\Component\Routing\Loader\AnnotationFileLoader;
use Symfony\Component\Routing\Route;
use Symfony\Component\Routing\RouteCollection;

/**
 * Class GovWikiLoader
 * @package GovWiki\ApiBundle\Router
 */
class GovWikiLoader extends AnnotationFileLoader
{

    /**
     * @var boolean
     */
    private $addPrefix;

    /**
     * @param FileLocatorInterface  $locator          A FileLocatorInterface
     *                                                instance.
     * @param AnnotationClassLoader $loader           A AnnotationClassLoader
     *                                                instance.
     * @param string                $determinatorName Determinator name.
     */
    public function __construct(
        FileLocatorInterface $locator,
        AnnotationClassLoader $loader,
        $determinatorName
    ) {
        parent::__construct($locator, $loader);
        $this->addPrefix = ('path' === $determinatorName);
    }

    /**
     * {@inheritdoc}
     */
    public function supports($resource, $type = null)
    {
        return is_string($resource) && ('govwiki' === $type);
    }

    /**
     * {@inheritdoc}
     */
    public function load($file, $type = null)
    {
        $path = $this->locator->locate($file);

        $collection = new RouteCollection();
        if ($class = $this->findClass($path)) {
            $collection->addResource(new FileResource($path));
            $collection->addCollection($this->loader->load($class, $type));

            if ($this->addPrefix) {
                /** @var Route $route */
                foreach ($collection as $route) {
                    $route->setPath('/{environment}'. $route->getPath());
                    $route->setRequirement('environment', '\w+');
                }

                $route = new Route('/', [
                    '_controller' => 'GovWikiFrontendBundle:Main:index',
                ]);
                $collection->add('main', $route);
            }
        }

        return $collection;
    }
}
