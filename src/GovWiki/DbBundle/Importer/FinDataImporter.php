<?php

namespace GovWiki\DbBundle\Importer;

use Doctrine\DBAL\Connection;
use Doctrine\ORM\Query;
use GovWiki\AdminBundle\Manager\AdminEnvironmentManager;
use GovWiki\DbBundle\Exception\RequiredColumnsNotFoundException;
use GovWiki\DbBundle\File\ReaderInterface;
use GovWiki\DbBundle\File\WriterInterface;

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
        Connection $con,
        AdminEnvironmentManager $manager
    ) {
        parent::__construct($con, $manager);

        /*
         * Get FinData entity metadata in order to generate required column
         * names and get they types.
         */
        /** @var \Doctrine\Orm\Mapping\ClassMetadata $metadata */
        $metadata = $this->manager->getMetadata('GovWikiDbBundle:FinData');

        $fields = $metadata->getFieldNames();
        $associationFields = $metadata->getAssociationMappings();

        foreach ($fields as $field) {
            $fieldMetadata = $metadata->getFieldMapping($field);
            $this->columns[$fieldMetadata['columnName']] = $fieldMetadata['type'];
        }
        /*
         * It added due to a typo in csv the column name.
         */

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
            /*
             * Check required keys exists, if don't do it before.
             */
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
        $this->con->exec(
            'INSERT IGNORE findata ('. implode(',', array_keys($this->columns)) .
            ') VALUES '. implode(',', $sql)
        );
    }
}
