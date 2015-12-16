<?php

namespace GovWiki\AdminBundle\Transformer\Service;

use GovWiki\AdminBundle\Exception\ExtensionNotFoundException;
use GovWiki\AdminBundle\Exception\FileTransformerException;
use GovWiki\AdminBundle\Transformer\FileTransformerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Mange all transformers.
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
     * @param string $filePath Path to transformed file.
     * @param string $alias    Transformer alias, if not set try guess by file
     *                         extension,
     *                         {@see FileTransformerInterface::getSupportedExtension}.
     *
     * @return array
     *
     * @throws FileTransformerException Some error occurred while
     *                                  transformation.
     */
    public function transform($filePath, $alias = null)
    {
        if (null === $alias) {
            return $this->getTransformer($this->fileToAlias($filePath))
                ->transform($filePath);
        } else {
            return $this->getTransformer($alias)->transform($filePath);
        }
    }

    /**
     * @return array Each element is assoc array with two keys:
     *               <ul>
     *                  <li>extension</li>
     *                  <li>name</li>
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
     * @param string $filePath Path to transformed file.
     *
     * @return string
     *
     * @throws ExtensionNotFoundException Cant resolve file extension.
     */
    private function fileToAlias($filePath)
    {
        $supported = [];
        $extension = strtolower(substr($filePath, strripos($filePath, '.')));
        foreach ($this->transformers as $alias => $transformer) {
            /** @var FileTransformerInterface $transformerClass */
            $transformerClass = $transformer['class'];
            if (array_key_exists(
                $extension,
                $transformerClass::supportedExtensions()
            )) {
                return $alias;
            }
            array_merge($supported, $transformerClass::supportedExtensions());
        }

        throw new ExtensionNotFoundException($extension, $supported);
    }
}
