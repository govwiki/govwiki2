<?php

namespace GovWiki\ApiBundle\Manager;

/**
 * Interface EnvironmentManagerAwareInterface
 * @package GovWiki\ApiBundle\Manager
 */
interface EnvironmentManagerAwareInterface
{
    /**
     * @param string $environment Environment name.
     *
     * @return EnvironmentManagerAwareInterface
     * @internal Call from configurator.
     */
    public function setEnvironment($environment);
}
