<?php

namespace CartoDbBundle\DependencyInjection;

use CartoDbBundle\CartoDbServices;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\Config\FileLocator;
use Symfony\Component\HttpKernel\DependencyInjection\Extension;
use Symfony\Component\DependencyInjection\Loader;

/**
 * Class CartoDbExtension
 * @package CartoDbBundle\DependencyInjection
 */
class CartoDbExtension extends Extension
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

        /*
         * Get carto db access parameters from configuration and pass to api
         * service.
         */
        $cartoDbApi = $container
            ->getDefinition(CartoDbServices::CARTO_DB_API);

        $cartoDbApi->setArguments([
            $config['api_key'],
            $config['account_name'],
        ]);
    }
}
