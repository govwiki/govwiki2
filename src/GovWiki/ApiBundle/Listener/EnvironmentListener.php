<?php

namespace GovWiki\ApiBundle\Listener;

use Symfony\Component\HttpKernel\Event\FilterControllerEvent;
use Symfony\Component\HttpKernel\Event\FilterResponseEvent;
use Symfony\Component\HttpKernel\Event\GetResponseEvent;

/**
 * Class EnvironmentListener
 * @package GovWiki\ApiBundle\Listener
 */
class EnvironmentListener
{
    const PARAM_NAME = 'env';

    /**
     * @param FilterControllerEvent $event A FilterControllerEvent instance.
     *
     * @return void
     *
     * @throws \RuntimeException PARAM_NAME not found in request.
     */
    public function onKernelController(FilterControllerEvent $event)
    {
        $controller = $event->getController();
        $parameters = (new \ReflectionMethod($controller[0], $controller[1]))
            ->getParameters();

        $hasEnvironmentParam = false;
        foreach ($parameters as $parameter) {
            if ('environment' === $parameter->getName()) {
                $hasEnvironmentParam = true;
                break;
            }
        }

        if ($hasEnvironmentParam) {
            $environment = $event->getRequest()->query
                ->get(self::PARAM_NAME, null);

            if (null === $environment) {
                throw new \RuntimeException(
                    'Provide query param '. self::PARAM_NAME
                );
            }

            $event->getRequest()->attributes->set('environment', $environment);
        }
    }
}
