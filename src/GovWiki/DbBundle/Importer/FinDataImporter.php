<?php

namespace GovWiki\DbBundle\Importer;

use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Query;
use GovWiki\DbBundle\Exception\RequiredColumnsNotFoundException;
use GovWiki\DbBundle\File\ReaderInterface;
use GovWiki\DbBundle\File\WriterInterface;
use GovWiki\EnvironmentBundle\Storage\EnvironmentStorageInterface;

/**
 * Class FinDataImporter
 * @package GovWiki\DbBundle\Importer
 */
class FinDataImporter extends AbstractImporter
{

    const MAX_INSERTS_PER_QUERY = 1000;

    /**
     * Array of FinData table/entity column names as key and their types as
     * value.
     *
     * @var array
     */
    private $columns = [];

    /**
     * {@inheritdoc}
     */
    public function __construct(
        EntityManagerInterface $em,
        EnvironmentStorageInterface $storage
    ) {
        parent::__construct($em, $storage);

        /*
         * Get FinData entity metadata in order to generate required column
         * names and get they types.
         */
        /** @var \Doctrine\Orm\Mapping\ClassMetadata $metadata */
        $metadata = $this->em->getClassMetadata('GovWikiDbBundle:FinData');

        $fields = $metadata->getFieldNames();
        $associationFields = $metadata->getAssociationMappings();

        foreach ($fields as $field) {
            if ('id' !== $field) {
                $fieldMetadata = $metadata->getFieldMapping($field);
                $this->columns[$fieldMetadata['columnName']] =
                    $fieldMetadata['type'];
            }
        }

        foreach ($associationFields as $field) {
            $this->columns[$field['joinColumns'][0]['name']] = 'integer';
        }
    }


    /**
     * {@inheritdoc}
     */
    public function import(ReaderInterface $reader) {
        $sql = [];
        $linesCount = 0;
        $columnChecked = false;

        foreach ($reader->read() as $row) {
            /// Check required keys exists, if don't do it before.

            if (! $columnChecked) {
                $notFounded = array_diff(
                    array_keys($this->columns),
                    array_keys($row)
                );

                if (is_array($notFounded) && (count($notFounded) !== 0)) {
                    throw new RequiredColumnsNotFoundException(
                        $notFounded,
                        $this->columns,
                        array_keys($row)
                    );
                }
                $columnChecked = true;

                $environment = $this->storage->get();

                // Remove the old information for the year.
                $this->em->getConnection()
                    ->exec("
                        DELETE f FROM findata f
                        INNER JOIN governments g ON g.id = f.government_id
                        WHERE
                            year = '{$row['year']}' AND
                            g.environment_id = '{$environment->getId()}'

                    ");
            }

            $parts = [];
            foreach ($this->columns as $name => $type) {
                $value = $row[$name];

                if (null === $value) {
                    $value = 'NULL';
                } elseif (('string' === $type)) {
                    $value = '\''. addslashes($value) .'\'';
                } elseif ('' === $value) {
                    $value = 'NULL';
                }

                $parts[] = $value;
            }
            $sql[] = '('. implode(',', $parts) .')';
            ++$linesCount;

            if (self::MAX_INSERTS_PER_QUERY === $linesCount) {
                $linesCount = 0;
                $this->update($sql);
                $sql = '';
            }
        }

        if (count($sql) > 0) {
            $this->update($sql);
        }
    }

    /**
     * {@inheritdoc}
     */
    public function export(WriterInterface $writer, $limit = null, $offset = 0)
    {

    }

    /**
     * @param array $sql Sql statement.
     *
     * @return void
     *
     * @throws \Doctrine\DBAL\DBALException Can't exec query.
     */
    private function update(array $sql)
    {
        $this->em->getConnection()->exec(
            'INSERT IGNORE INTO findata ('. implode(',', array_keys($this->columns)) .
            ') VALUES '. implode(',', $sql)
        );
    }
}
