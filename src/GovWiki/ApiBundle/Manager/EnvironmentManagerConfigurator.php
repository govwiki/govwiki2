<?php

namespace GovWiki\ApiBundle\Manager;

use Doctrine\ORM\EntityManagerInterface;
use GovWiki\ApiBundle\Exception\GovWikiApiEnvironmentNotFoundException;
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
     *
     * @throws GovWikiApiEnvironmentNotFoundException Can't find environment
     *                                                name for current domain
     *                                                name.
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
            if (null === $this->environment) {
                throw new GovWikiApiEnvironmentNotFoundException($host);
            }
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
