<?php

namespace GovWiki\FileLibraryBundle\Storage\Index;

use GovWiki\DbBundle\Entity\Environment;
use GovWiki\FileLibraryBundle\Entity\AbstractFile;
use GovWiki\FileLibraryBundle\Entity\Directory;
use GovWiki\FileLibraryBundle\Entity\Document;
use GovWiki\FileLibraryBundle\Entity\EntityFactory;
use GovWiki\FileLibraryBundle\Repository\FileRepository;
use GovWiki\FileLibraryBundle\Storage\FileListBuilderInterface;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Mapping\ClassMetadataInfo;

/**
 * Interface StorageIndexInterface
 *
 * @package GovWiki\FileLibraryBundle\Storage\Index
 */
class ORMStorageIndex implements StorageIndexInterface
{

    const MAX_DEFERRED_BUCKET_SIZE = 200;

    /**
     * @var integer
     */
    private $deferredBucketSize = 0;

    /**
     * @var EntityFactory
     */
    private $entityFactory;

    /**
     * @var EntityManagerInterface
     */
    private $em;

    /**
     * @var Directory[]
     * @psalm-var Array<string, Directory>
     */
    private $createdDirectories = [];

    /**
     * ORMStorageIndex constructor.
     *
     * @param EntityFactory          $entityFactory A EntityFactory instance.
     * @param EntityManagerInterface $em            A EntityManagerInterface instance.
     */
    public function __construct(
        EntityFactory $entityFactory,
        EntityManagerInterface $em
    ) {
        $this->entityFactory = $entityFactory;
        $this->em = $em;
    }

    /**
     * @param Environment $environment Required environment.
     * @param string      $path        Path to created directory.
     *
     * @return $this
     *
     * @api
     */
    public function createDirectory(Environment $environment, string $path)
    {
        $this->createDirectoryByPath($environment, $path);

        return $this;
    }

    /**
     * @param Environment $environment Required environment.
     * @param string      $path        Path to required directory.
     *
     * @return Directory|null
     */
    public function getDirectory(Environment $environment, string $path)
    {
        /** @var FileRepository $repository */
        $repository = $this->em->getRepository(AbstractFile::class);

        $directory = $repository->findByPublicPath($environment->getName(), $path);

        if (($directory === null) || (! $directory instanceof Directory)) {
            return null;
        }

        return $directory;
    }

    /**
     * @param Environment $environment Required environment.
     * @param string      $path        Path where file should be created.
     * @param integer     $size        Stored file size.
     *
     * @return $this
     *
     * @api
     */
    public function createFile(Environment $environment, string $path, int $size)
    {
        $directoryPath = \dirname($path);

        $directory = $this->getDirectory($environment, $directoryPath);
        if ($directory === null) {
            $directory = $this->createDirectoryByPath($environment, $directoryPath);
        }

        $this->em->persist($this->entityFactory->createDocument(
            $environment,
            \basename($path),
            $size,
            $directory
        ));

        if (++$this->deferredBucketSize >= self::MAX_DEFERRED_BUCKET_SIZE) {
            $this->flush();
        }

        return $this;
    }

    /**
     * @param Environment $environment Required environment.
     * @param string      $path        Path to required file.
     *
     * @return Document|null
     */
    public function getFile(Environment $environment, string $path)
    {
        /** @var FileRepository $repository */
        $repository = $this->em->getRepository(AbstractFile::class);

        $document = $repository->findByPublicPath($environment->getName(), $path);

        if (($document === null) || (! $document instanceof Document)) {
            return null;
        }

        return $document;
    }

    /**
     *
     * @param Environment $environment Required environment.
     * @param string|null $path        Path to directory.
     *
     * @return FileListBuilderInterface
     */
    public function createFileListBuilder(Environment $environment, string $path = null): FileListBuilderInterface
    {
        return new ORMFileListBuilder($this->em, $environment, $path);
    }

    /**
     * @param Environment $environment Required environment.
     * @param string      $srcPath     Path from which we should move file.
     * @param string      $destPath    Path to which we should move.
     *
     * @return $this
     *
     * @api
     */
    public function move(Environment $environment, string $srcPath, string $destPath)
    {
        if ($srcPath === $destPath) {
            return $this;
        }

        /** @var FileRepository $repository */
        $repository = $this->em->getRepository(AbstractFile::class);
        $file = $repository->findByPublicPath($environment->getName(), $srcPath);

        if ($file !== null) {
            $this->em->remove($file);
            $this->createFile($environment, $destPath, $file->getFileSize());
        }

        return $this;
    }

    /**
     * @param Environment $environment Required environment.
     * @param string      $path        A path to removed file.
     *
     * @return $this
     *
     * @api
     */
    public function remove(Environment $environment, string $path)
    {
        /** @var FileRepository $repository */
        $repository = $this->em->getRepository(AbstractFile::class);

        $file = $repository->findByPublicPath($environment->getName(), $path);
        if ($file !== null) {
            $this->em->remove($file);
        }

        if (++$this->deferredBucketSize >= self::MAX_DEFERRED_BUCKET_SIZE) {
            $this->flush();
        }

        return $this;
    }

    /**
     * Clear whole index.
     *
     * @param Environment $environment Required environment.
     *
     * @return $this
     */
    public function clearIndex(Environment $environment)
    {
        $connection = $this->em->getConnection();
        /** @var ClassMetadataInfo $metadata */
        $metadata = $this->em->getClassMetadata(AbstractFile::class);

        $connection->exec('SET FOREIGN_KEY_CHECKS = 0');
        $connection->exec(sprintf(
            '
                DELETE FROM %s
                WHERE environment_id = %s
            ',
            $metadata->getTableName(),
            $environment->getId()
        ));
        $connection->exec('SET FOREIGN_KEY_CHECKS = 1');

        return $this;
    }

    /**
     * Flush changes.
     *
     * @return $this
     */
    public function flush()
    {
        $this->deferredBucketSize = 0;
        $this->createdDirectories = [];
        $this->em->flush();

        return $this;
    }

    /**
     * @param Environment $environment Required environment.
     * @param string      $path        Path to created directory.
     *
     * @return Directory
     */
    private function createDirectoryByPath(Environment $environment, string $path): Directory
    {
        $parts = \explode('/', $path);
        \array_shift($parts);

        $directory = $this->entityFactory->createDirectoryByPath($environment, $parts);
        $this->em->persist($directory);

        //
        // All directories should be flushed immediately.
        //
        $this->em->flush($directory);

        return $directory;
    }
}
