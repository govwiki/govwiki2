<?php

namespace GovWiki\FileLibraryBundle\Serialize\Normalizer;

use GovWiki\FileLibraryBundle\Entity\Directory;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;

/**
 * Class DirectoryNormalizer
 *
 * @package GovWiki\FileLibraryBundle\Serialize\Normalizer
 */
class DirectoryNormalizer implements NormalizerInterface
{

    /**
     * @var UrlGeneratorInterface
     */
    private $urlGenerator;

    /**
     * DirectoryNormalizer constructor.
     *
     * @param UrlGeneratorInterface $urlGenerator A UrlGeneratorInterface instance.
     */
    public function __construct(UrlGeneratorInterface $urlGenerator)
    {
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
        return $data instanceof Directory;
    }

    /**
     * Normalizes an object into a set of arrays/scalars.
     *
     * @param object|Directory $object  Object to normalize.
     * @param string           $format  Format the normalization result will be encoded as.
     * @param array            $context Context options for the normalizer.
     *
     * @return array
     */
    public function normalize($object, $format = null, array $context = []): array
    {
        if (isset($context['admin']['environment'])) {
            $urls = [
                'self' => $this->urlGenerator->generate('govwiki_admin_library_index', [
                    'environment' => $context['admin']['context'],
                    'slug' => $object->getSlug(),
                ], UrlGeneratorInterface::ABSOLUTE_URL),
            ];
        } else {
            $urls = [
                'self' => $this->urlGenerator->generate('govwiki_filelibrary_document_index', [
                    'slug' => $object->getSlug(),
                ], UrlGeneratorInterface::ABSOLUTE_URL),
            ];
        }

        return [
            'type' => 'directory',
            'id' => $object->getId(),
            'name' => $object->getName(),
            'slug' => $object->getSlug(),
            'createdAt' => $object->getCreatedAt()->format('c'),
            'parent' => $object->getParent() ? $object->getParent()->getId() : null,
            'publicPath' => $object->getPublicPath(),
            'fileSize' => null,
            'urls' => $urls,
        ];
    }
}
