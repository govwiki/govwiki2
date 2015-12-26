<?php

namespace GovWiki\ApiBundle\Determinator;

use Symfony\Component\Routing\RouterInterface;

/**
 * Class PathDeterminator
 * @package GovWiki\ApiBundle\Determinator
 */
class PathDeterminator extends AbstractEnvironmentDeterminator
{
    /**
     * @param RouterInterface $router A RouterInterface instance.
     * @param boolean         $debug  Flag.
     */
    public function __construct(RouterInterface $router, $debug)
    {
        $path = $router->getContext()->getPathInfo();
        /*
         * Assume that first component of path is environment slug. In
         * development environment use second component.
         */
        $this->slug = explode('/', $path)[($debug) ? 1 : 0];
    }
}
