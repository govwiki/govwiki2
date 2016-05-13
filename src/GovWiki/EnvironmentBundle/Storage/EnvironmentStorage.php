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
            $this->environment = new Environment();
            $reflection = new \ReflectionProperty($this->environment, 'id');
            $reflection->setAccessible(true);
            $reflection->setValue($this->environment, -1);
            $reflection->setAccessible(false);
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
