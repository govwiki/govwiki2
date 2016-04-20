<?php

namespace GovWiki\EnvironmentBundle\Strategy;

use GovWiki\DbBundle\Entity\Environment;

/**
 * Interface DefaultNamingStrategy
 * @package GovWiki\EnvironmentBundle\Strategy
 */
final class DefaultNamingStrategy
{
    /**
     * @param Environment $environment A Environment entity instance.
     *
     * @return string
     */
    public static function environmentRelatedTableName(Environment $environment)
    {
        return $environment->getSlug();
    }

    /**
     * @param string $field Original field name.
     *
     * @return string
     */
    public static function rankedFieldName($field)
    {
        return $field .'_rank';
    }

    /**
     * @param string $rankFieldName Ranked field name.
     *
     * @return string
     */
    public static function originalFromRankFieldName($rankFieldName)
    {
        return substr($rankFieldName, 0, strpos($rankFieldName, '_rank'));
    }

    /**
     * @param Environment $environment A Environment entity instance.
     *
     * @return string
     */
    public static function maxRanksTableName(Environment $environment)
    {
        return $environment->getSlug() .'_max_ranks';
    }
}
