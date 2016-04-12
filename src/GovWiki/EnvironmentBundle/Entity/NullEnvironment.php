<?php

namespace GovWiki\EnvironmentBundle\Entity;

use GovWiki\DbBundle\Entity\Environment;

/**
 * Class NullEnvironment
 * @package GovWiki\EnvironmentBundle\Entity
 */
class NullEnvironment extends Environment
{

    /**
     *
     */
    public function __construct($domain)
    {
        parent::__construct();

    }
}
