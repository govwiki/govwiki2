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
     * @var string
     */
    private $cartoDBPrefix = '';

    /**
     * @var Environment
     */
    private $environment;

    /**
     * @param string $cartoDBPrefix Prefix for cartodb dataset.
     */
    public function __construct($cartoDBPrefix = '')
    {
        $this->cartoDBPrefix = $cartoDBPrefix;
    }

    /**
     * Get current environment entity instance.
     *
     * @return Environment|null
     */
    public function get()
    {
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
        if ($environment !== null) {
            $environment->setCartoDBPrefix($this->cartoDBPrefix);
        }
        $this->environment = $environment;
    }
}
