<?php

namespace GovWiki\FileLibraryBundle\Storage;

/**
 * Class Directory
 *
 * @package GovWiki\FileLibraryBundle\Storage
 */
class Directory extends AbstractFile
{

    /**
     * @return FileListBuilderInterface
     */
    public function getListBuilder(): FileListBuilderInterface
    {
        $path = $this->path;
        if ($path === '/') {
            //
            // Because we don't index root directory.
            //
            $path = null;
        }
        return $this->index->createFileListBuilder($this->environment, $path);
    }
}
