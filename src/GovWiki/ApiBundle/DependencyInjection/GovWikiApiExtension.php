<?php

namespace GovWiki\ApiBundle\DependencyInjection;

use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\Config\FileLocator;
use Symfony\Component\HttpKernel\DependencyInjection\Extension;
use Symfony\Component\DependencyInjection\Loader;

/**
 * This is the class that loads and manages your bundle configuration
 *
 * To learn more see {@link http://symfony.com/doc/current/cookbook/bundles/extension.html}
 */
class GovWikiApiExtension extends Extension
{
    /**
     * {@inheritdoc}
     */
    public function load(array $configs, ContainerBuilder $container)
    {
        $configuration = new Configuration();
        $config = $this->processConfiguration($configuration, $configs);

        $loader = new Loader\YamlFileLoader($container, new FileLocator(__DIR__.'/../Resources/config'));
        $loader->load('services.yml');

        $alias = $container->getParameter('determinator.name');
        $determinators = $container
            ->findTaggedServiceIds('environment.determinator');

        $configurator = $container
            ->getDefinition('govwiki_api.environment_manager.configurator');
        foreach ($determinators as $id => $tag) {
            if ($alias === $tag[0]['alias']) {
                $configurator->setArguments([
                    $container->getDefinition($id),
                ]);
                break;
            }
        }
    }
}
