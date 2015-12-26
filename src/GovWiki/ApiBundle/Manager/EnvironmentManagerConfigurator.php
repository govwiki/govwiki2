<?php

namespace GovWiki\ApiBundle\Manager;

use Doctrine\ORM\EntityManagerInterface;
use GovWiki\ApiBundle\Determinator\AbstractEnvironmentDeterminator;
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
     * @param AbstractEnvironmentDeterminator $determinator A AbstractEnvironmentDeterminator
     *                                                      instance.
     */
    public function __construct(AbstractEnvironmentDeterminator $determinator)
    {
        $this->determinator = $determinator;
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
        $manager->setEnvironment($this->determinator->getSlug());
    }
}
