<?php

namespace GovWiki\ApiBundle\Determinator;

use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Routing\RouterInterface;

/**
 * Class PathDeterminator
 * @package GovWiki\ApiBundle\Determinator
 */
class PathDeterminator extends AbstractEnvironmentDeterminator
{
    /**
     * @param RouterInterface $router A RouterInterface instance.
     * @param RequestStack    $stack  A RequestStack instance.
     */
    public function __construct(RouterInterface $router, RequestStack $stack)
    {
        $request = $stack->getMasterRequest();
        $this->slug = '';
        if (null !== $request) {
            $path = $router->getContext()->getPathInfo();
            $route = $router->match($request->getPathInfo());

            if ((strpos($route['_controller'], 'Frontend') !== false) ||
                (strpos($route['_controller'], 'Api') !== false)
            ) {
                /*
                 * Assume that first component of path is environment slug.
                 */
                $this->slug = explode('/', $path)[1];
            }
        }
    }
}
