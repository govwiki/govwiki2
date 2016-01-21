<?php

namespace GovWiki\DbBundle\Importer;

use Doctrine\DBAL\Connection;
use GovWiki\AdminBundle\Exception\FileTransformerException;
use GovWiki\AdminBundle\Manager\AbstractAdminEntityManager;
use GovWiki\AdminBundle\Manager\AdminEnvironmentManager;
use GovWiki\AdminBundle\Transformer\FileTransformerInterface;
use GovWiki\ApiBundle\GovWikiApiServices;
use GovWiki\DbBundle\Exception\InvalidFieldNameException;
use GovWiki\DbBundle\Reader\ReaderInterface;
use GovWiki\DbBundle\Writer\WriterInterface;

/**
 * Class AbstractImporter
 * @package GovWiki\DbBundle\Importer
 */
abstract class AbstractImporter
{

    /**
     * @var Connection
     */
    protected $con;

    /**
     * @var AdminEnvironmentManager
     */
    protected $manager;

    /**
     * @param Connection              $con     A Connection instance.
     * @param AdminEnvironmentManager $manager A AdminEnvironmentManager
     *                                         instance.
     */
    public function __construct(
        Connection $con,
        AdminEnvironmentManager $manager
    ) {
        $this->con = $con;
        $this->manager = $manager;
    }

    /**
     * @param ReaderInterface $reader A ReaderInterface instance.
     *
     * @return void
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
