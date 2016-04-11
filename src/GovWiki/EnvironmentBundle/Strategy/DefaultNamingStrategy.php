<?php

namespace GovWiki\EnvironmentBundle\Strategy;

use GovWiki\DbBundle\Entity\Environment;

/**
 * Interface DefaultNamingStrategy
 * @package GovWiki\EnvironmentBundle\Strategy
 */
class DefaultNamingStrategy implements NamingStrategyInterface
{
    /**
     * {@inheritdoc}
     */
    public function getEnvironmentRelatedTableName(Environment $environment)
    {
        return $environment->getSlug();
    }
}
