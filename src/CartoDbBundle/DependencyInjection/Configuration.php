<?php

namespace CartoDbBundle\DependencyInjection;

use Symfony\Component\Config\Definition\Builder\TreeBuilder;
use Symfony\Component\Config\Definition\ConfigurationInterface;

/**
 * Class Configuration
 * @package CartoDbBundle\DependencyInjection
 */
class Configuration implements ConfigurationInterface
{
    /**
     * {@inheritdoc}
     */
    public function getConfigTreeBuilder()
    {
        $treeBuilder = new TreeBuilder();
        $rootNode = $treeBuilder->root('carto_db');

        /*
         * Require CartoDB api key.
         */
        $rootNode->children()
            ->scalarNode('api_key')
                ->isRequired()
                ->cannotBeEmpty()
            ->end();

        /*
         * Require CartoDB account name.
         */
        $rootNode->children()
            ->scalarNode('account_name')
                ->isRequired()
                ->cannotBeEmpty()
            ->end();

        return $treeBuilder;
    }
}
