<?php

namespace GovWiki\ApiBundle\Manager;

use Doctrine\ORM\EntityManagerInterface;
use GovWiki\ApiBundle\Determinator\AbstractEnvironmentDeterminator;
use Symfony\Component\HttpKernel\Event\GetResponseEvent;
use Symfony\Component\Routing\RouterInterface;

/**
 * Configurator for EnvironmentManager.
 *
 * @package GovWiki\ApiBundle\Manager
 */
class EnvironmentManagerConfigurator
{

    /**
     * @var AbstractEnvironmentDeterminator
     */
    private $determinator;

    /**
     * @var string
     */
    private $slug;

    /**
     * @param AbstractEnvironmentDeterminator $determinator A AbstractEnvironmentDeterminator instance.
     */
    public function __construct(AbstractEnvironmentDeterminator $determinator)
    {
        $this->determinator = $determinator;
    }

    /**
     * @param GetResponseEvent $event A GetResponseEvent instance.
     *
     * @return void
     */
    public function onKernelRequest(GetResponseEvent $event)
    {
        $this->slug = $this->determinator->getSlug($event->getRequest());
    }

    /**
     * @param EnvironmentManagerAwareInterface $manager A
     *                                                  EnvironmentManagerAwareInterface
     *                                                  instance.
     *
     * @return void
     */
    public function configure(EnvironmentManagerAwareInterface $manager)
    {
        $manager->setEnvironment($this->slug);
    }
}
