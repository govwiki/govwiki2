<?php

namespace GovWiki\ApiBundle\Listener;

use GovWiki\ApiBundle\Manager\EnvironmentManager;
use Symfony\Component\HttpKernel\Event\GetResponseEvent;

/**
 * Class EnvironmentListener
 * @package GovWiki\ApiBundle\Listener
 */
class EnvironmentListener
{
    const PARAM_NAME = 'env';

    /**
     * @var EnvironmentManager
     */
    private $manager;

    /**
     * @param EnvironmentManager $manager A EnvironmentManager instance.
     */
    public function __construct(EnvironmentManager $manager)
    {
        $this->manager = $manager;
    }

    /**
     * @param GetResponseEvent $event A GetResponseEvent instance.
     *
     * @return void
     *
     * @throws \RuntimeException PARAM_NAME not found in request.
     */
    public function onKernelRequest(GetResponseEvent $event)
    {
        $request = $event->getRequest();
        $environment = $request->query->get(self::PARAM_NAME, null);

        if (strpos($request->getPathInfo(), 'api') !== false) {
            if (null === $environment) {
                throw new \RuntimeException(
                    'Provide query param ' . self::PARAM_NAME
                );
            }

            $this->manager->setEnvironment($environment);
        }


    }
}
