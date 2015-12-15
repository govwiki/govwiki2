<?php

namespace GovWiki\AdminBundle\Manager;

use Doctrine\ORM\EntityManagerInterface;
use GovWiki\ApiBundle\Exception\GovWikiApiEnvironmentNotFoundException;
use GovWiki\ApiBundle\Manager\EnvironmentManagerAwareInterface;
use GovWiki\ApiBundle\Manager\EnvironmentManagerConfigurator;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Routing\RouterInterface;

/**
 * Configurator for EnvironmentManager.
 *
 * @package GovWiki\ApiBundle\Manager
 */
class AdminEnvironmentManagerConfigurator extends EnvironmentManagerConfigurator
{
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
        RouterInterface $router,
        RequestStack $requestStack
    ) {

        $this->environment = $em->getRepository('GovWikiDbBundle:Environment')
            ->getNameByDomain($host);
        if (null === $this->environment) {
            throw new GovWikiApiEnvironmentNotFoundException($host);
        }
    }
}
