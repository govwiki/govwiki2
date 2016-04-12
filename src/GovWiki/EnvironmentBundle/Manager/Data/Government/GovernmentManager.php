<?php

namespace GovWiki\EnvironmentBundle\Manager\Data\Government;

use GovWiki\DbBundle\Entity\Repository\GovernmentRepository;
use GovWiki\EnvironmentBundle\Manager\Data\AbstractDataManager;

/**
 * Class GovernmentManager
 * @package GovWiki\EnvironmentBundle\Data\Manager\Data\Government
 */
class GovernmentManager extends AbstractDataManager implements
    GovernmentManagerInterface
{

    /**
     * {@inheritdoc}
     */
    public function createTable($tableName, array $columnDefinitions = [])
    {
        /*
         * Generate column definition from given columns.
         */
        $columnSqlDefinition = '';
        foreach ($columnDefinitions as $fieldName => $type) {
            $type = $this->getDataTypeConverter()
                ->abstract2database($type);

            $columnSqlDefinition .= "`{$fieldName}` {$type} DEFAULT NULL";
        }

        $this->em->getConnection()->exec("
            CREATE TABLE `{$tableName}` (
                `id` int(11) NOT NULL AUTO_INCREMENT,
                `government_id` int(11) DEFAULT NULL,
                CONSTRAINT `fk_{$tableName}_government`
                    FOREIGN KEY (`government_id`)
                    REFERENCES `governments` (`id`),
                {$columnSqlDefinition}
                PRIMARY KEY (`id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
        ");

        return $this;
    }

    /**
     * {@inheritdoc}
     */
    public function removeTable($tableName)
    {
        $this->em->getConnection()
            ->exec("DROP TABLE IF EXISTS `{$tableName}``");
    }

    /**
     * {@inheritdoc}
     */
    public function get($tableName, $government, array $columnDefinitions)
    {
        if (is_array($columnDefinitions) &&
            (count($columnDefinitions) > 0)) {
            /*
             * Get the names of all fields.
             */
            $fields = implode(',', array_keys($columnDefinitions));

            $data = $this->em->getConnection()->fetchAssoc("
                SELECT {$fields} FROM {$tableName}
                WHERE government_id = {$government}
            ");

            /*
             * Set properly type for values.
             */
            $validData = [];
            foreach ($data as $field => $value) {
                $type = $columnDefinitions[$field];

                switch ($type) {
                    case 'integer':
                        $value = (int) $value;
                        break;

                    case 'float':
                        $value = (float) $value;
                        break;
                }

                $validData[$field] = $value;
            }

            return $validData;
        }

        return [];
    }

    /**
     * {@inheritdoc}
     */
    public function search($environment, $partOfName)
    {
        /** @var GovernmentRepository $repository */
        $repository = $this->em->getRepository('GovWikiDbBundle:Government');

        return $repository->search($environment, $partOfName);
    }
}
