<?php

namespace GovWiki\EnvironmentBundle\Manager\Government;

use GovWiki\DbBundle\Entity\Environment;
use GovWiki\DbBundle\Entity\Format;
use GovWiki\DbBundle\Entity\Government;

/**
 * Interface GovernmentManagerInterface
 * @package GovWiki\EnvironmentBundle\Data\Manager\Data\Government
 */
interface GovernmentManagerInterface
{

    /**
     * Return available years for current environment.
     *
     * @param Environment        $environment A Environment entity instance.
     * @param Government|integer $government  A Government entity instance.
     *
     * @return integer[]
     */
    public function getAvailableYears(
        Environment $environment,
        $government = null
    );

    /**
     * @param Environment $environment A Environment entity instance.
     * @param string      $altTypeSlug A Government entity altTypeSlug instance.
     * @param string      $slug        A Government entity slug instance.
     *
     * @return integer[]
     */
    public function getGovernmentAvailableYears(
        Environment $environment,
        $altTypeSlug,
        $slug
    );

    /**
     * @param Environment $environment       A Environment entity instance.
     * @param array       $columnDefinitions Column definitions
     *                                       {@see EnvironmentManagerInterface::format2columnDefinition}.
     *
     * @return GovernmentManagerInterface
     *
     * @throws \Doctrine\DBAL\DBALException SQL error while creating.
     */
    public function createTable(Environment $environment, array $columnDefinitions = []);

    /**
     * @param Environment $environment A Environment entity instance.
     *
     * @return void
     *
     * @throws \Doctrine\DBAL\DBALException SQL error while removing.
     */
    public function removeTable(Environment $environment);

    /**
     * @param Environment $environment    A Environment entity id.
     * @param string      $altTypeSlug    Slugged alt type.
     * @param string      $governmentSlug Slugged government name.
     * @param array       $parameters     Array of parameters:
     *                                    <ul>
     *                                        <li>field_name (required)</li>
     *                                        <li>limit (required)</li>
     *                                        <li>page</li>
     *                                        <li>order</li>
     *                                        <li>name_order</li>
     *                                        <li>year</li>
     *                                    </ul>.
     *
     * @return array
     */
    public function getGovernmentRank(
        Environment $environment,
        $altTypeSlug,
        $governmentSlug,
        array $parameters
    );

    /**
     * @param Environment $environment A Environment entity instance.
     * @param string      $partOfName  Part of government name.
     *
     * @return array
     */
    public function searchGovernment(Environment $environment, $partOfName);

    /**
     * @param Environment $environment A Environment entity instance.
     * @param string      $partOfName  Part of government name.
     *
     * @return array
     */
    public function searchGovernmentForComparison(
        Environment $environment,
        $partOfName
    );

    /**
     * Get revenues and expenditures by government.
     *
     * @param Environment $environment A Environment entity instance.
     * @param array       $governments Array of object, each contains id and
     *                                 year.
     *
     * @return array
     */
    public function getCategoriesForComparisonByGovernment(
        Environment $environment,
        array $governments
    );

    /**
     * Add to each governments 'data' field with specified findata caption
     * dollar amount and total for fund category.
     *
     * @param Environment $environment A Environment entity instance.
     * @param array       $data        Request in form described in
     *                                 {@see ComparisonController::compareAction}.
     *
     * @return array
     *
     * @throws \Doctrine\ORM\Query\QueryException Query result is not unique.
     */
    public function getComparedGovernments(Environment $environment, array $data);

    /**
     * @param Environment $environment A Environment entity instance.
     * @param string      $altTypeSlug Slugged government alt type.
     * @param string      $slug        Slugged government name.
     * @param integer     $year        For fetching fin data.
     *
     * @return array
     */
    public function getGovernment(
        Environment $environment,
        $altTypeSlug,
        $slug,
        $year = null
    );

    /**
     * @param Environment $environment A Environment entity instance.
     * @param integer     $government  A Government entity id.
     * @param integer     $year        Data year.
     * @param array       $fields      List of fetched field names. If null -
     *                                 fetch all.
     */
    public function getEnvironmentRelatedData(
        Environment $environment,
        $government,
        $year,
        array $fields = null
    );

    /**
     * @param Environment $environment A Environment entity instance.
     * @param integer     $government  A Government entity id or null. If null
     *                                 get for all government.
     * @param string      $fieldName   Condition field.
     *
     * @return array
     */
    public function getConditionValuesForGovernment(
        Environment $environment,
        $government,
        $fieldName
    );

    /**
     * @param Environment $environment A Environment entity instance.
     * @param string      $fieldName   Condition field.
     *
     * @return array
     */
    public function getConditionValues(Environment $environment, $fieldName);

    /**
     * @param Environment $environment A Environment entity instance.
     * @param integer     $government  A Government entity id.
     * @param integer     $year        A data year, if null delete data for all
     *                                 years.
     *
     * @return void
     */
    public function removeData(Environment $environment, $government, $year = null);

    /**
     * @param Environment $environment A Environment entity instance.
     * @param Government  $government  Updated government entity instance.
     * @param array       $data        Environment related data.
     *
     * @return void
     *
     * @throws \Doctrine\DBAL\DBALException Can't execute query.
     */
    public function persistGovernmentData(
        Environment $environment,
        Government $government,
        array $data
    );

    /**
     * @param Environment $environment A Environment entity instance.
     * @param Government  $government  Updated government entity instance.
     * @param integer     $year        Data year.
     * @param array       $data        Environment related data.
     *
     * @return void
     *
     * @throws \Doctrine\DBAL\DBALException Can't execute query.
     */
    public function updateGovernmentData(
        Environment $environment,
        Government $government,
        $year,
        array $data
    );

    /**
     * Add new column to environment related government table.
     *
     * @param Environment $environment A Environment entity instance.
     * @param string      $name        Column name.
     * @param string      $type        Column type like 'string', 'integer' and
     *                                 etc.
     *
     * @return void
     */
    public function addColumn(Environment $environment, $name, $type);

    /**
     * Change column name and type.
     *
     * @param Environment $environment A Environment entity instance.
     * @param string      $oldName     Old column name.
     * @param string      $newName     New column name.
     * @param string      $newType     New column type.
     *
     * @return void
     */
    public function changeColumn(
        Environment $environment,
        $oldName,
        $newName,
        $newType
    );

    /**
     * @param Environment $environment A Environment entity instance.
     * @param string      $name        Column name.
     *
     * @return void
     */
    public function deleteColumn(Environment $environment, $name);

    /**
     * @param Environment $environment A Environment entity instance.
     * @param boolean     $slugged     Return altTypeSlug's instead of altType's
     *                                 if true.
     *
     * @return string[]
     */
    public function getUsedAltTypes(Environment $environment, $slugged = false);

    /**
     * @param Environment  $environment A Environment entity instance.
     * @param Format|array $format      A Format entity instance.
     *
     * @return void
     *
     * @throws \Doctrine\DBAL\DBALException Error while update.
     */
    public function calculateRanks(Environment $environment, $format);
}
