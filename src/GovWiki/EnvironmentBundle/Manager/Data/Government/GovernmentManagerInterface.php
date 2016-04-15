<?php

namespace GovWiki\EnvironmentBundle\Manager\Data\Government;

use GovWiki\DbBundle\Entity\Environment;

/**
 * Interface GovernmentManagerInterface
 * @package GovWiki\EnvironmentBundle\Data\Manager\Data\Government
 */
interface GovernmentManagerInterface
{

    /**
     * @param Environment $environment       A Environment entity instance.
     * @param array       $columnDefinitions Column definitions
     *                                       {@see EnvironmentManagerInterface::format2columnDefinition}.
     *
     * @return GovernmentManagerInterface
     *
     * @throws \Doctrine\DBAL\DBALException SQL error while creating.
     */
    public function createTable(Environment $environment, array $columnDefinitions);

    /**
     * @param Environment $environment A Environment entity instance.
     *
     * @return void
     *
     * @throws \Doctrine\DBAL\DBALException SQL error while removing.
     */
    public function removeTable(Environment $environment);

    /**
     * Get environment related data for government.
     *
     * @param Environment $environment A Environment entity instance.
     * @param integer     $government  Government entity id.
     * @param integer     $year        Year of fetching data.
     * @param array       $fields      Array of fetching fields.
     *
     * @return mixed
     */
    public function get(Environment $environment, $government, $year, array $fields);

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
    public function searchGovernmentForComparison(
        Environment $environment,
        $partOfName
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
}
