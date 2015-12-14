<?php

namespace GovWiki\AdminBundle\DependencyInjection\Compiler;

use GovWiki\AdminBundle\GovWikiAdminServices;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;

/**
 * Class FileTransformerCompiler
 * @package GovWiki\AdminBundle\DependencyInjection\Compiler
 */
class FileTransformerCompiler implements CompilerPassInterface
{
    /**
     * {@inheritdoc}
     */
    public function process(ContainerBuilder $container)
    {
        if (! $container
                ->hasDefinition(GovWikiAdminServices::TRANSFORMER_MANAGER)) {
            return;
        }

        $transformerManager = $container->getDefinition(
            GovWikiAdminServices::TRANSFORMER_MANAGER
        );

        $transformers = $container->findTaggedServiceIds('transformer');
        foreach ($transformers as $id => $tags) {
            $transformerManager->addMethodCall('addTransformer', [
                $id,
                $tags[0]['alias'],
                $container->getDefinition($id)->getClass()
            ]);
        }
    }
}
