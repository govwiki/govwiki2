<?php

namespace GovWiki\EnvironmentBundle\Manager\Data\Government;

use GovWiki\EnvironmentBundle\Exception\UnknownAbstractTypeException;

/**
 * Interface GovernmentManagerInterface
 * @package GovWiki\EnvironmentBundle\Data\Manager\Data\Government
 */
interface GovernmentManagerInterface
{

    /**
     * @param string $tableName         Environment specific government data
     *                                  table name.
     * @param array  $columnDefinitions Column definitions
     *                                  {@see EnvironmentManagerInterface::format2columnDefinition}.
     *
     * @return GovernmentManagerInterface
     *
     * @throws UnknownAbstractTypeException Unknown type.
     * @throws \Doctrine\DBAL\DBALException SQL error while removing.
     */
    public function createTable($tableName, array $columnDefinitions = []);

    /**
     * @param string $tableName Environment specific government data
     *                          table name.
     *
     * @return void
     */
    public function removeTable($tableName);

    /**
     * @param string  $tableName         Environment specific government data
     *                                   table name.
     * @param integer $government        Government entity id.
     * @param array   $columnDefinitions Column definitions
     *                                   {@see EnvironmentManagerInterface::format2columnDefinition}.
     *
     * @return mixed
     */
    public function get($tableName, $government, array $columnDefinitions);

    /**
     * Search governments by the part of name in specified environment.
     *
     * @param string $environment Environment entity slug.
     * @param string $partOfName  Part of government name.
     *
     * @return mixed
     */
    public function search($environment, $partOfName);
}
