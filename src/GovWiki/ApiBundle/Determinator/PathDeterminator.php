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
     * @param RequestStack $stack  A RequestStack instance.
     */
    public function __construct(RequestStack $stack)
    {
        $request = $stack->getMasterRequest();
        $this->slug = '';
        if (null !== $request) {
            $controller = $request->attributes->get('_controller');
            if ((strpos($controller, 'Frontend') !== false) ||
                (strpos($controller, 'Api') !== false) ||
                (strpos($controller, 'Comment') !== false)
            ) {
                $this->slug = $request->attributes->get('environment', '');
//                $this->slug = explode('/', $path)[1];
            }
        }
    }
}
