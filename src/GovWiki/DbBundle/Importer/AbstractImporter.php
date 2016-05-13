<?php

namespace GovWiki\DbBundle\Importer;

use Doctrine\ORM\EntityManagerInterface;
use GovWiki\DbBundle\Exception\GovWikiDbBundleException;
use GovWiki\DbBundle\File\ReaderInterface;
use GovWiki\DbBundle\File\WriterInterface;
use GovWiki\EnvironmentBundle\Storage\EnvironmentStorageInterface;

/**
 * Class AbstractImporter
 * @package GovWiki\DbBundle\Importer
 */
abstract class AbstractImporter
{

    /**
     * @var EntityManagerInterface
     */
    protected $em;

    /**
     * @var EnvironmentStorageInterface
     */
    protected $storage;

    /**
     * @param EntityManagerInterface      $em      A EntityManagerInterface
     *                                             instance.
     * @param EnvironmentStorageInterface $storage A EnvironmentStorageInterface
     *                                             instance.
     */
    public function __construct(
        EntityManagerInterface $em,
        EnvironmentStorageInterface $storage
    ) {
        $this->em = $em;
        $this->storage = $storage;
    }

    /**
     * @param ReaderInterface $reader A ReaderInterface instance.
     *
     * @return void
     *
     * @throws GovWikiDbBundleException Some error occurs while importing. More
     * explanation in concrete importer and in exception message.
     * @throws \RuntimeException Some error from reader.
     * @throws \Doctrine\DBAL\DBALException Can't import.
     */
    abstract public function import(ReaderInterface $reader);

    /**
     * @param WriterInterface $writer A WriterInterface instance.
     * @param integer         $limit  Max elements count to import.
     * @param integer         $offset Offset from table start.
     *
     * @return void
     */
    abstract public function export(WriterInterface $writer, $limit = null, $offset = 0);
}
