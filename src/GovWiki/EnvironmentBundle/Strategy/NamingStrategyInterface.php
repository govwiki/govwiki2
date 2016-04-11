<?php

namespace GovWiki\EnvironmentBundle\Strategy;

use GovWiki\DbBundle\Entity\Environment;

/**
 * Interface NamingStrategyInterface
 * @package GovWiki\EnvironmentBundle\Strategy
 */
interface NamingStrategyInterface
{
    /**
     * @param Environment $environment A Environment entity instance.
     *
     * @return string
     */
    public function getEnvironmentRelatedTableName(Environment $environment);
}
