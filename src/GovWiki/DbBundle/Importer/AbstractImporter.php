<?php

namespace GovWiki\DbBundle\Importer;

use GovWiki\AdminBundle\Exception\FileTransformerException;
use GovWiki\AdminBundle\Manager\AbstractAdminEntityManager;
use GovWiki\AdminBundle\Manager\AdminEnvironmentManager;
use GovWiki\AdminBundle\Transformer\FileTransformerInterface;
use GovWiki\DbBundle\Exception\InvalidFieldNameException;

/**
 * Class AbstractImporter
 * @package GovWiki\DbBundle\Importer
 */
abstract class AbstractImporter
{
    /**
     * @var AdminEnvironmentManager
     */
    protected $manager;

    /**
     * @param AbstractAdminEntityManager $manager A AbstractAdminEntityManager
     *                                            instance.
     */
    public function __construct(AbstractAdminEntityManager $manager)
    {
        $this->manager = $manager;
    }

    /**
     * @param string                   $filePath    Path to imported file.
     * @param FileTransformerInterface $transformer A FileTransformerInterface
     *                                              instance.
     *
     * @return void
     *
     * @throws InvalidFieldNameException One of field not found in entity.
     * @throws FileTransformerException File transformation fail.
     */
    abstract public function import(
        $filePath,
        FileTransformerInterface $transformer
    );

    /**
     * @param string                   $filePath    Path to imported file.
     * @param array                    $columns     Array of exported columns.
     * @param FileTransformerInterface $transformer A FileTransformerInterface
     *                                              instance.
     *
     * @return void
     *
     * @throws InvalidFieldNameException One of field not found in entity.
     * @throws FileTransformerException File transformation fail.
     */
    abstract public function export(
        $filePath,
        FileTransformerInterface $transformer,
        array $columns = null
    );
}
