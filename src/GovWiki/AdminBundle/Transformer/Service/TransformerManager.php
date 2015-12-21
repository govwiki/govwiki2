<?php

namespace GovWiki\AdminBundle\Transformer\Service;

use GovWiki\AdminBundle\Transformer\FileTransformerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Access point to all registered transformers.
 *
 * @package GovWiki\AdminBundle\Service
 */
class TransformerManager
{
    /**
     * @var ContainerInterface
     */
    private $container;

    /**
     * @var array
     */
    private $transformers = [];

    /**
     * @param ContainerInterface $container A ContainerInterface instance.
     */
    public function __construct(ContainerInterface $container)
    {
        $this->container = $container;
    }

    /**
     * Add new transformer to collection. Called from CompilerPass.
     *
     * @param string $id    Transformer service id.
     * @param string $alias Alias for transformer.
     * @param string $class Transformer class name.
     *
     * @return void
     */
    public function addTransformer($id, $alias, $class)
    {
        $this->transformers[$alias] = [
            'id' => $id,
            'class' => $class,
        ];
    }

    /**
     * @return array Each element is assoc array with two keys:
     *               <ul>
     *                  <li>File extension</li>
     *                  <li>Name</li>
     *               </ul>
     */
    public function getSupportedExtension()
    {
        $supported = [];
        foreach ($this->transformers as $alias => $transformer) {
            /** @var FileTransformerInterface $transformerClass */
            $transformerClass = $transformer['class'];
            $supported[$alias] = [
                'extension' => $transformerClass::supportedExtensions()[0],
                'name' => $transformerClass::getFormatName(),
            ];
        }

        return $supported;
    }

    /**
     * @param string $alias Transformer alias.
     *
     * @return FileTransformerInterface
     */
    public function getTransformer($alias)
    {
        return $this->container->get($this->transformers[$alias]['id']);
    }

    /**
     * @param string $fileName Filename.
     *
     * @return object
     *
     * @throws \InvalidArgumentException File without extension or unknown
     *  extension.
     */
    public function getTransformerByFileName($fileName)
    {
        if (strpos($fileName, '.') === false) {
            throw new \InvalidArgumentException(
                "$fileName don't have extension"
            );
        }

        $extension = explode('.', $fileName)[1];

        foreach ($this->transformers as $alias => $transformer) {
            /** @var FileTransformerInterface $transformerClass */
            $transformerClass = $transformer['clase'];
            if (in_array($extension, $transformerClass::supportedExtensions(), true)) {
                return $this->container->get($this->transformers[$alias]['id']);
            }
        }

        throw new \InvalidArgumentException("Unknown extension $extension");
    }
}
