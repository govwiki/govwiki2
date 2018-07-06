<?php

namespace GovWiki\FileLibraryBundle\Serialize\Normalizer;

use GovWiki\EnvironmentBundle\Storage\EnvironmentStorageInterface;
use GovWiki\FileLibraryBundle\Entity\Document;
use GovWiki\FileLibraryBundle\Storage\Storage;
use GovWiki\FileLibraryBundle\Storage\StorageFactory;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;

/**
 * Class DocumentNormalizer
 *
 * @package GovWiki\FileLibraryBundle\Serialize\Normalizer
 */
class DocumentNormalizer implements NormalizerInterface
{

    const USER_ACTION_URLS = [
        'self' => 'govwiki_filelibrary_document_index',
        'move' => 'govwiki_filelibrary_document_move',
        'rename' => 'govwiki_filelibrary_document_rename',
        'remove' => 'govwiki_filelibrary_document_remove',
    ];

    const ADMIN_ACTION_URLS = [
        'self' => 'govwiki_admin_library_index',
        'move' => 'govwiki_admin_library_move',
        'rename' => 'govwiki_admin_library_rename',
        'remove' => 'govwiki_admin_library_remove',
    ];

    /**
     * @var Storage
     */
    private $storage;

    /**
     * @var UrlGeneratorInterface
     */
    private $urlGenerator;

    /**
     * DocumentNormalizer constructor.
     *
     * @param StorageFactory              $factory            A StorageFactory
     *                                                        instance.
     * @param EnvironmentStorageInterface $environmentStorage A EnvironmentStorageInterface
     *                                                        instance.
     * @param UrlGeneratorInterface       $urlGenerator       A UrlGeneratorInterface
     *                                                        instance.
     */
    public function __construct(
        StorageFactory $factory,
        EnvironmentStorageInterface $environmentStorage,
        UrlGeneratorInterface $urlGenerator
    ) {
        $this->storage = $factory->createStorage($environmentStorage->get());
        $this->urlGenerator = $urlGenerator;
    }

    /**
     * Checks whether the given class is supported for normalization by this
     * normalizer.
     *
     * @param mixed  $data   Data to normalize.
     * @param string $format The format being (de-)serialized from or into.
     *
     * @return boolean
     */
    public function supportsNormalization($data, $format = null): bool
    {
        return $data instanceof Document;
    }

    /**
     * Normalizes an object into a set of arrays/scalars.
     *
     * @param object|Document $object  Object to normalize.
     * @param string          $format  Format the normalization result will be encoded as.
     * @param array           $context Context options for the normalizer.
     *
     * @return array
     */
    public function normalize($object, $format = null, array $context = []): array
    {
        $urls = [
            'download' => $this->storage->generatePublicUrl($object->getPublicPath()),
        ];

        if (isset($context['admin']['environment'])) {
            foreach (self::USER_ACTION_URLS as $name => $route) {
                $urls[$name] = $this->urlGenerator->generate(
                    $route,
                    [
                        'environment' => $context['admin']['environment'],
                        'slug' => $object->getSlug(),
                    ],
                    UrlGeneratorInterface::ABSOLUTE_URL
                );
            }
        } else {
            foreach (self::USER_ACTION_URLS as $name => $route) {
                $urls[$name] = $this->urlGenerator->generate(
                    $route,
                    [ 'slug' => $object->getSlug() ],
                    UrlGeneratorInterface::ABSOLUTE_URL
                );
            }
        }

        return [
            'type' => 'document',
            'id' => $object->getId(),
            'name' => $object->getName(),
            'ext' => $object->getExt(),
            'slug' => $object->getSlug(),
            'createdAt' => $object->getCreatedAt()->format('c'),
            'parent' => $object->getParent() ? $object->getParent()->getId() : null,
            'publicPath' => $object->getPublicPath(),
            'fileSize' => $object->getFileSize(),
            'urls' => $urls,
        ];
    }
}
