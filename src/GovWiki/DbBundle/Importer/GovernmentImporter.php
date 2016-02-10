<?php

namespace GovWiki\DbBundle\Importer;

use CartoDbBundle\Service\CartoDbApi;
use Doctrine\DBAL\Connection;
use Doctrine\ORM\Query;
use GovWiki\AdminBundle\Manager\AdminEnvironmentManager;
use GovWiki\DbBundle\File\ReaderInterface;
use GovWiki\DbBundle\File\WriterInterface;

/**
 * Class GovernmentImporter
 * @package GovWiki\DbBundle\Importer
 */
class GovernmentImporter extends AbstractImporter
{
    /**
     * @var CartoDbApi
     */
    private $api;

    /**
     * @param Connection              $con     A Connection instance.
     * @param AdminEnvironmentManager $manager A AdminEnvironmentManager
     *                                         instance.
     * @param CartoDbApi              $api     A CartoDBApi instance.
     */
    public function __construct(
        Connection $con,
        AdminEnvironmentManager $manager,
        CartoDbApi $api
    ) {
        parent::__construct($con, $manager);
        $this->api = $api;
    }

    /**
     * {@inheritdoc}
     */
    public function import(ReaderInterface $reader) {
        $governmentSqlParts = [];
        $cartoDbSqlParts = [];
        $formats = [];

        $typesCollected = false;

        /*
         * Get columns names.
         */
        $header = $reader->read();
        foreach ($header as $column) {
            if ('environment_id' === $column) {
                break;
            }

            if (strpos($column, '_rank') !== false) {
                $field = str_replace('_rank', '', $column);
                $formats[$field]['ranked'] = true;
            } else {
                $formats[$column] = [
                    'show_in'         => serialize([]),
                    'data_or_formula' => 'data',
                    'ranked'          => false,
                    'help_text'       => '',
                    'environment_id'  => $this->manager->getReference()->getId(),
                    'name'            => ucwords(str_replace('_', ' ', $column)),
                ];
            }
        }

        while (($row = $reader->read()) !== null) {
            dump($row);
        }

//        $data = $transformer->transform($filePath);
//        $id = $this->manager->getEnvironmentReference()->getId();
//
//        $insertStmts = [];
//        $columns = [ 'environment_id' ];
//        foreach (array_keys($data[0]) as $field) {
//            $str = strtolower(preg_replace('|([A-Z])|', '_$1', $field));
//            $str = preg_replace('|(\d+)|', '_$1', $str);
//            $columns[] = $str;
//        }
//
//        foreach ($data as $row) {
//            foreach ($row as &$value) {
//                $value = (empty($value)) ? 'null' : '"'. $value .'"';
//            }
//
//            $insertStmts[] = '(' . $id . ', '. implode(',', $row). ')';
//        }
//
//        $this->con->exec('
//            insert into governments ('. implode(',', $columns) .') values
//            '. implode(',', $insertStmts) .'
//        ');
    }

    /**
     * {@inheritdoc}
     */
    public function export(WriterInterface $writer, $limit = null, $offset = 0)
    {
        $stmt = $this->manager->getGovernments($limit, $offset);

        foreach ($stmt->fetchAll() as $row) {
            $writer->write($row);
        }
    }
}
