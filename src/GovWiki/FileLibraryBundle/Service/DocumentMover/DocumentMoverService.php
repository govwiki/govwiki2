<?php

namespace GovWiki\FileLibraryBundle\Service\DocumentMover;

use GovWiki\FileLibraryBundle\Entity\Directory;
use GovWiki\FileLibraryBundle\Entity\Document;
use GovWiki\FileLibraryBundle\Storage\Storage;

/**
 * Class DocumentMoverService
 *
 * @package GovWiki\FileLibraryBundle\Service\DocumentMover
 */
class DocumentMoverService
{

    const FILENAME_PATTERN = '/(?P<year>\d{4})\.\w+$/';

    /**
     * @var Storage
     */
    private $storage;

    /**
     * DocumentMoverService constructor.
     *
     * @param Storage $storage A Storage instance.
     */
    public function __construct(Storage $storage)
    {
        $this->storage = $storage;
    }

    /**
     * @param Document    $document          Moved document instance.
     * @param Directory   $topLevelDirectory Top level directory where document
     *                                       should be.
     * @param string|null $name              New document name if it needed.
     *
     * @return void
     */
    public function move(Document $document, Directory $topLevelDirectory = null, string $name = null)
    {
        $file = $this->storage->getFile($document->getPublicPath());

        if ($file === null) {
            return;
        }

        //
        // Build path to top level directory.
        //
        $path = '/';
        $newTopLevelDirectory = $topLevelDirectory ?? $document->getTopLevelDir();
        if ($newTopLevelDirectory !== null) {
            $path = $newTopLevelDirectory->getPublicPath();
        }

        if ($name === null) {
            $name = $document->getName() .'.'. $document->getExt();
        }

        $year = $this->getYearFromDocumentName($name);

        $file->move($path .'/'. $year .'/'. $name);
    }

    /**
     * @param string $name A new document name.
     *
     * @return string
     *
     * @psalm-suppress MixedInferredReturnType
     */
    private function getYearFromDocumentName(string $name): string
    {
        $matches = [];
        if ((preg_match(self::FILENAME_PATTERN, $name, $matches) !== 1) || ! isset($matches['year'])) {
            throw new DocumentMoverException(sprintf(
                'Can\'t determine year from document "%s"',
                $name
            ));
        }

        /** @psalm-suppress MixedReturnStatement */
        return $matches['year'];
    }
}
