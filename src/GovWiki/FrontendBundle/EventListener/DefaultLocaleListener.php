<?php

namespace GovWiki\FrontendBundle\EventListener;

use GovWiki\ApiBundle\Manager\EnvironmentManager;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpKernel\Event\GetResponseEvent;

/**
 * Class DefaultLocaleListener
 * @package GovWiki\FrontendBundle\EventListener
 */
class DefaultLocaleListener
{
    /**
     * @var ContainerInterface
     */
    private $container;

    /**
     * @param ContainerInterface $container A ContainerInterface instance.
     */
    public function __construct(ContainerInterface $container)
    {
        $this->container = $container;
    }

    /**
     * @param GetResponseEvent $event A GetResponseEvent instance.
     *
     * @return void
     */
    public function onKernelRequest(GetResponseEvent $event)
    {
//        $request = $event->getRequest();
//        $controller = $request->attributes->get('_controller');
//
//        if (!$request->hasPreviousSession() ||
//            (strpos($controller, 'Frontend') === false)) {
//            return;
//        }
//
//        if ($locale = $request->attributes->get('_locale')) {
//            $request->getSession()->set('_locale', $locale);
//        } else {
//            $defaultLocale = $this->container->get('govwiki_api.manager.environment')->getDefaultLocale();
//
//            $request->setLocale($request->getSession()->get('_locale', $defaultLocale));
//        }
    }
}
