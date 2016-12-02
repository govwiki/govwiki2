<?php

namespace GovWiki\GeneratorBundle\Twig;

use GovWiki\EnvironmentBundle\Storage\EnvironmentStorageInterface;
use Symfony\Bridge\Twig\Extension\AssetExtension as BaseExtension;
use Symfony\Bridge\Twig\Extension\HttpFoundationExtension;
use Symfony\Component\Asset\Packages;
use Symfony\Component\HttpFoundation\RequestStack;

/**
 * Class AssetExtension
 * @package GovWiki\GeneratorBundle\Twig
 */
class AssetExtension extends BaseExtension
{

    /**
     * @var RequestStack
     */
    private $requestStack;

    /**
     * @var string
     */
    private $webPath;

    /**
     * @var EnvironmentStorageInterface
     */
    private $storage;

    /**
     * @param Packages                $packages            A Packages instance.
     * @param RequestStack            $requestStack        A RequestStack
     *                                                     instance.
     * @param string                  $webPath             Path to web directory.
     * @param HttpFoundationExtension $foundationExtension A HttpFoundationExtension
     *                                                     instance.
     */
    public function __construct(
        Packages $packages,
        RequestStack $requestStack,
        $webPath,
        HttpFoundationExtension $foundationExtension = null,
        EnvironmentStorageInterface $storage
    ) {
        parent::__construct($packages, $foundationExtension);
        $this->requestStack = $requestStack;
        $this->webPath = $webPath;
        $this->storage = $storage;
    }

    /**
     * {@inheritdoc}
     */
    public function getFilters()
    {
        $filters = parent::getFilters();

        return array_merge($filters, [
            new \Twig_SimpleFilter('content', [
                $this,
                'getContent',
            ], [ 'is_safe' => [ 'html' ] ]),

            new \Twig_SimpleFilter('fromServer', function ($path) {
                $environment = $this->storage->get();
                return 'http://'. $environment->getDomain() .$path;
            }),
        ]);
    }

    /**
     * Returns the public path of an asset.
     *
     * Absolute paths (i.e. http://...) are returned unmodified.
     *
     * @param string           $path        A public path
     * @param string           $packageName The name of the asset package to use
     * @param bool             $absolute    Whether to return an absolute URL or a relative one
     * @param string|bool|null $version     A specific version
     *
     * @return string A public path which takes into account the base path and URL path
     */
    public function getAssetUrl($path, $packageName = null, $absolute = false, $version = null)
    {
        $path = parent::getAssetUrl($path, $packageName, $absolute, $version);

        if ($this->requestStack->getMasterRequest() === null) {
            $path = $this->webPath . $path;

            if (! file_exists($path)) {
                return $path;
            }

            $mime = 'application/octet-stream';
            if (function_exists('mime_content_type')) {
                $mime = mime_content_type($path);
            }

            if ($info = @getimagesize($path)) {
                $mime = $info['mime'];
            }

            if (strpos($mime, 'image') !== false) {
                $content = file_get_contents($path);

                return 'data:' . $mime . ';base64,' . base64_encode($content);
            }
        }

        return $path;
    }

    /**
     * @param string $path Public path to asset file.
     *
     * @return string
     */
    public function getContent($path)
    {
        $path = realpath($path);

        if (file_exists($path)) {
            return file_get_contents($path);
        }

        return '';
    }
}
