<?php

namespace GovWiki\ApiBundle\Manager;

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Routing\RouterInterface;

/**
 * Configurator for EnvironmentManager.
 *
 * @package GovWiki\ApiBundle\Manager
 */
class EnvironmentManagerConfigurator
{
    /**
     * @var string
     */
    protected $environment;

    /**
     * @param EntityManagerInterface $em     A EntityManagerInterface instance.
     * @param RouterInterface        $router A RouterInterface instance.
     */
    public function __construct(
        EntityManagerInterface $em,
        RouterInterface $router
    ) {
        $host = $router->getContext()->getHost();

        if ('localhost' === $host) {
            $this->environment = 'localhost';
        } else {
            $this->environment = $em->getRepository('GovWikiDbBundle:Environment')
                ->getNameByDomain($host);
        }
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
        $manager->setEnvironment($this->environment);
    }
}
