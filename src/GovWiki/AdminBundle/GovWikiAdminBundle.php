<?php

namespace GovWiki\AdminBundle;

use GovWiki\AdminBundle\DependencyInjection\Compiler\FileTransformerCompiler;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\HttpKernel\Bundle\Bundle;

/**
 * Class GovWikiAdminBundle
 * @package GovWiki\AdminBundle
 */
class GovWikiAdminBundle extends Bundle
{
    /**
     * {@inheritdoc}
     */
    public function build(ContainerBuilder $container)
    {
        parent::build($container);
        $container->addCompilerPass(new FileTransformerCompiler());
    }
}
