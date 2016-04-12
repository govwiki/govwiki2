<?php

namespace GovWiki\EnvironmentBundle\Storage;

use GovWiki\DbBundle\Entity\Environment;

/**
 * Interface EnvironmentStorage
 * @package GovWiki\EnvironmentBundle\Storage
 */
class EnvironmentStorage implements EnvironmentStorageInterface
{
    /**
     * @var Environment
     */
    private $environment;

    /**
     * Get current environment entity instance.
     *
     * @return Environment
     */
    public function get()
    {
        if ($this->environment === null) {
            $nullEnvironment = new Environment();
            return $nullEnvironment;
        }

        return $this->environment;
    }

    /**
     * Store given environment into storage.
     *
     * @param Environment $environment A Environment entity instance.
     *
     * @return void
     */
    public function set(Environment $environment = null)
    {
        $this->environment = $environment;
    }
}
