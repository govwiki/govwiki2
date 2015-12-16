<?php

namespace GovWiki\DbBundle\Importer;

use Doctrine\ORM\EntityManagerInterface;
use GovWiki\AdminBundle\Exception\FileTransformerException;
use GovWiki\AdminBundle\Transformer\FileTransformerInterface;
use GovWiki\DbBundle\Exception\InvalidFieldNameException;

/**
 * Class AbstractImporter
 * @package GovWiki\DbBundle\Importer
 */
abstract class AbstractImporter
{
    /**
     * @var EntityManagerInterface
     */
    private $em;

    /**
     * @param EntityManagerInterface $em EntityManagerInterface instance.
     */
    public function __construct(EntityManagerInterface $em)
    {
        $this->em = $em;
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
        array $columns,
        FileTransformerInterface $transformer
    );

    /**
     * Entity name supported by this importer.
     *
     * @return string
     */
    abstract protected function getEntityName();

    /**
     * @return \Doctrine\Common\Persistence\ObjectRepository
     */
    protected function getRepository()
    {
        return $this->em->getRepository($this->getEntityName());
    }

    /**
     * @param object $entity Entity object to persist.
     *
     * @return void
     */
    protected function persist($entity)
    {
        $this->em->persist($entity);
    }

    /**
     * @return void
     */
    protected function flush()
    {
        $this->flush();
    }

    /**
     * @param array $columns Exported columns.
     *
     * @return string
     */
    protected function prepareSelect(array $columns)
    {
        $name = substr(
            $this->getEntityName(),
            strrpos($this->getEntityName(), '\\') + 1
        );

        foreach ($columns as &$column) {
            $column = "$name.$column";
        }

        return implode(',', $columns);
    }
}
