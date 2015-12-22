<?php

namespace GovWiki\DbBundle\Importer;

use GovWiki\AdminBundle\Transformer\FileTransformerInterface;

/**
 * Class GovernmentImporter
 * @package GovWiki\DbBundle\Importer
 */
class GovernmentImporter extends AbstractImporter
{
    /**
     * {@inheritdoc}
     */
    public function import(
        $filePath,
        FileTransformerInterface $transformer
    ) {
        $data = $transformer->transform($filePath);
        $id = $this->manager->getEnvironmentReference()->getId();

        $insertStmts = [];
        $columns = [ 'environment_id' ];
        foreach (array_keys($data[0]) as $field) {
            $str = strtolower(preg_replace('|([A-Z])|', '_$1', $field));
            $str = preg_replace('|(\d+)|', '_$1', $str);
            $columns[] = $str;
        }

        foreach ($data as $row) {
            foreach ($row as &$value) {
                $value = (empty($value)) ? 'null' : '"'. $value .'"';
            }

            $insertStmts[] = '(' . $id . ', '. implode(',', $row). ')';
        }

        $this->con->exec('
            insert into governments ('. implode(',', $columns) .') values
            '. implode(',', $insertStmts) .'
        ');
    }

    /**
     * {@inheritdoc}
     */
    public function export(
        $filePath,
        FileTransformerInterface $transformer,
        array $columns = null,
        $offset = 0,
        $limit = null
    ) {
        $data = $this->manager->getAll($columns, $offset, $limit);
        $transformer->reverseTransform($filePath, $data);
    }
}
