<?php

namespace GovWiki\EnvironmentBundle\Storage;

use GovWiki\DbBundle\Entity\Environment;

/**
 * Interface EnvironmentStorageInterface
 * @package GovWiki\EnvironmentBundle\Storage
 */
interface EnvironmentStorageInterface
{
    /**
     * Get current environment entity instance.
     *
     * @return Environment
     */
    public function get();

    /**
     * Store given environment into storage.
     *
     * @param Environment $environment A Environment entity instance.
     *
     * @return void
     */
    public function set(Environment $environment = null);
}
