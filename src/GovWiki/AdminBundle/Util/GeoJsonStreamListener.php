<?php
namespace GovWiki\AdminBundle\Util;

use CartoDbBundle\Service\CartoDbApi;
use Doctrine\ORM\EntityManagerInterface;
use GovWiki\AdminBundle\Exception\InvalidGeoJsonException;
use GovWiki\AdminBundle\Manager\GovernmentTableManager;
use GovWiki\DbBundle\Entity\Environment;
use GovWiki\DbBundle\Entity\Format;
use GovWiki\DbBundle\Entity\Government;
use Symfony\Component\Debug\Exception\FatalErrorException;

/**
 * Class GeoJsonStreamListener
 * @package GovWiki\AdminBundle\Util
 */
class GeoJsonStreamListener implements \JsonStreamingParser_Listener
{
    const IN_COLLECTION = 1;
    const IN_FEATURE = 2;
    const IN_GEOMETRY = 4;
    const IN_PROPERTIES = 8;

    const COORDINATES_COLLECT = 16;
    const PROPERTIES_COLLECT = 32;

    const MAX_SQL_PARTS_SIZE = 1000;

    /**
     * Data from properties of feature and also contains current geometry type.
     *
     * @var array
     */
    private $data;

    /**
     * Coordinates of feature.
     *
     * @var array
     */
    private $coordinates;

    /**
     * @var integer
     */
    private $level;

    /**
     * @var integer
     */
    private $flags;

    /**
     * @var string
     */
    private $currentKey;

    /**
     * @var Environment
     */
    private $environment;

    /**
     * @var array
     */
    private $sqls = [];

    /**
     * @var array
     */
    private $metadata;

    /**
     * @var EntityManagerInterface
     */
    private $em;

    /**
     * @var CartoDbApi
     */
    private $api;

    /**
     * @var boolean
     */
    private $isMetadataUpdated = false;

    /**
     * @var array
     */
    private $envRelatedGovernmentFields;

    /**
     * @param EntityManagerInterface $em          A EntityManagerInterface
     *                                            instance.
     * @param CartoDbApi             $api         A CartoDbApi instance.
     * @param Environment            $environment A Environment instance.
     */
    public function __construct(
        EntityManagerInterface $em,
        CartoDbApi $api,
        Environment $environment
    ) {
        $this->em = $em;
        $this->api = $api;
        $this->environment = $environment;
    }

    /**
     * @return void
     */
    public function start_document()
    {
        // Do nothing.
    }

    /**
     * @return void
     *
     * @throws \Exception While processing transaction.
     * @throws \Doctrine\DBAL\DBALException Some error while insert governments.
     * @throws \InvalidArgumentException Invalid column type.
     * @throws \Doctrine\DBAL\ConnectionException If the commit failed due to no
     * active transaction or because the transaction was marked for rollback
     * only.
     */
    public function end_document()
    {
        if (count($this->sqls['db']) > 0) {
            /*
             * Insert last fields.
             */
            $this->update();
        }
    }

    /**
     * @return void
     */
    public function start_array()
    {
        if ($this->isFlagSet(self::IN_GEOMETRY)) {
            /*
             * If we currently in geometry object of feature assume what each
             * array is coordinates of feature.
             */
            $this->level++;
        }
    }

    /**
     * @return void
     */
    public function end_array()
    {
        if ((0 !== $this->level) && $this->isFlagSet(self::IN_GEOMETRY)) {
            /*
             * Add collected array to previous.
             */
            $this->coordinates[$this->level - 1][] =
                $this->coordinates[$this->level];
            $this->coordinates[$this->level] = [];
            $this->level--;
        }
    }

    /**
     * @return void
     */
    public function start_object()
    {
        if ((null === $this->currentKey) &&
            (! $this->isFlagSet(self::IN_COLLECTION))) {
            /*
             * FeatureCollection started.
             */
            $this->setFlag(self::IN_COLLECTION);
        } elseif ('geometry' === $this->currentKey) {
            /*
             * Geometry object started.
             */
            $this->setFlag(self::IN_GEOMETRY);
        } elseif ('properties' === $this->currentKey) {
            /*
             * Property object started.
             */
            $this->setFlag(self::IN_PROPERTIES);
        } elseif (! $this->isFlagSet(self::IN_FEATURE)) {
            /*
             * Process concrete point or polygon.
             */
            $this->data = [];
            $this->coordinates = [];
            $this->level = -1;
        }
    }

    /**
     * If data collected, update database.
     *
     * @return void
     *
     * @throws InvalidGeoJsonException Can't get alt type name.
     * @throws \Exception While processing transaction.
     * @throws \Doctrine\DBAL\DBALException Some error while insert governments.
     * @throws \InvalidArgumentException Invalid column type.
     * @throws \Doctrine\DBAL\ConnectionException If the commit failed due to no
     * active transaction or because the transaction was marked for rollback
     * only.
     */
    public function end_object()
    {
        if ($this->isFlagSet(self::IN_GEOMETRY)) {
            /*
             * End process of coordinates.
             */
            $this->unsetFlag(self::IN_GEOMETRY);
            $this->setFlag(self::COORDINATES_COLLECT);
        } elseif ($this->isFlagSet(self::IN_PROPERTIES)) {
            /*
             * End process of properties.
             */
            $this->unsetFlag(self::IN_PROPERTIES);
            $this->setFlag(self::PROPERTIES_COLLECT);
        } elseif ($this->isFlagSet(self::IN_FEATURE) &&
            $this->isFlagSet(self::COORDINATES_COLLECT) &&
            $this->isFlagSet(self::PROPERTIES_COLLECT)
        ) {
            /*
             * End process of feature.
             */
            if (array_key_exists('geometry_type', $this->data)) {
                /*
                 * Find out feature type.
                 * Assume that we have only point's and polygon's
                 * (multi polygon's).
                 */
                $isCounty = 'Point' !== $this->data['geometry_type'];
                $this->coordinates = $this->coordinates[0];
                if ($isCounty) {
                    /*
                     * Check coordinates of last point.
                     */
                    $lastIdx = count($this->coordinates[0]) - 1;

                    $last = $this->coordinates[0][$lastIdx];
                    $first = $this->coordinates[0][0];

                    if (is_array($last)) {
                        $last = $last[count($last) - 1];
                        $first = $first[count($first) - 1];
                    }

                    if ((abs($last[0] - $first[0]) > 0.001) || (abs($last[1] - $first[1]) > 0.001)) {
                        $this->coordinates[0][0][] = $this->coordinates[0][0][0];
                    }

                    if ('MultiPolygon' === $this->data['geometry_type']) {
                        /*
                         * Multi polygon's additionally wrap
                         * coordinates into another array, otherwise CartoDB return
                         * error.
                         */
                        $this->coordinates = [ $this->coordinates ];
                    }
                }
                $isCounty = (int) $isCounty;

                /*
                 * Create GeoJson for concrete government.
                 */
                $json = json_encode([
                    'type'        => $this->data['geometry_type'],
                    'coordinates' => $this->coordinates,
                ]);

                /*
                 * Remove geometry type from data.
                 */
                unset($this->data['geometry_type']);

                /*
                 * Prepare government name, alt type and they slug.
                 */
                $name = $this->data['name'];
                $slug = Government::slugifyName($name);
                $altType = $this->getAltType();
                $altTypeSlug = Government::slugifyAltType($altType);

                if (! array_key_exists('columns', $this->sqls)) {
                    /*
                     * If information about columns not collected, do it.
                     */
                    $this->metadata = $this->collectMetadata($this->data);
                }

                /*
                 * Generate sql parts for insert into government table.
                 */
                $insertParts = [];
                foreach ($this->metadata['government'] as $column => $data) {
                    /*
                     * Get value for current column from read data.
                     */
                    if (('slug' !== $column) || ('alt_type_slug' !== $column)) {
                        $insertParts[] = $this
                            ->getFieldValueFromData($column, $data);
                    }
                }

                $this->sqls['db'][] = "
                    ({$this->environment->getId()}, {$isCounty}, ".
                    "'{$slug}', '{$altTypeSlug}', ". implode(',', $insertParts) .')';

                /*
                 * Generate sql parts for insert into environment related
                 * government table.
                 */
                $insertParts = [];
                foreach ($this->metadata['extended'] as $column => $data) {
                    /*
                     * Get value for current column from read data.
                     */
                    $insertParts[] = $this
                        ->getFieldValueFromData($column, $data);

                    if (array_key_exists('ranked', $data) && $data['ranked']) {
                        /*
                         * Add ranked column value.
                         */
                        $rankValue = $this->data[$column. '_rank'];
                        if (null === $rankValue) {
                            $rankValue = 'NULL';
                        }

                        $insertParts[] = $rankValue;

                    }
                }
                /*
                 * Sql for fetching government_id for this government.
                 */
                $idSql = "
                    SELECT id FROM governments
                    WHERE slug = '{$slug}' AND
                        alt_type_slug = '{$altTypeSlug}' AND
                        environment_id = {$this->environment->getId()}
                    LIMIT 1
                ";

                $this->sqls['government'][] = "(({$idSql}),". implode(',', $insertParts) .')';

                /*
                 * Add sql parts for insert into CartoDB dataset.
                 */
                $this->sqls['cartodb'][] =
                    "(ST_SetSRID(ST_GeomFromGeoJSON('{$json}'), 4326)," .
                    "'{$altTypeSlug}','{$slug}')";

                if (count($this->sqls['cartodb']) === self::MAX_SQL_PARTS_SIZE) {
                    /*
                     * Update parts of data.
                     */
                    $this->update();
                }
            }

            $this->data = [];

            $this->unsetFlag(self::IN_FEATURE);
        }
    }

    /**
     * @param string $key Current key.
     *
     * @return void
     */
    public function key($key)
    {
        $this->currentKey = $key;
    }

    /**
     * @param string|integer|boolean|null $value Value.
     *
     * @return void
     *
     * @throws InvalidGeoJsonException If json file contains unexpected values.
     */
    public function value($value)
    {
        if ((('type' === $this->currentKey) && ('Feature' === $value)) &&
            $this->isFlagSet(self::IN_COLLECTION) &&
            ! $this->isFlagSet(self::IN_FEATURE)
        ) {
            /*
             * Currently Feature object started.
             */
            $this->setFlag(self::IN_FEATURE);
        } elseif ($this->isFlagSet(self::IN_GEOMETRY)) {
            if ('coordinates' === $this->currentKey) {
                /*
                 * Store coordinates.
                 */
                $this->coordinates[$this->level][] = $value;
            } else {
                /*
                 * Store geometry type.
                 */
                $this->data['geometry_type'] = $value;
            }
        } elseif ($this->isFlagSet(self::IN_PROPERTIES)) {
            /*
             * Store properties.
             */
            $this->data[$this->currentKey] = $value;
        }
    }

    /**
     * @param string $whitespace Whitespace characters.
     *
     * @return void
     */
    public function whitespace($whitespace)
    {
        // Do nothing.
    }

    /**
     * @return string
     *
     * @throws InvalidGeoJsonException Can't get alt type name.
     */
    private function getAltType()
    {
        if (array_key_exists('kind', $this->data)) {
            $altType = $this->data['kind'];
        } elseif (array_key_exists('alt_type', $this->data)) {
            $altType = $this->data['alt_type'];
        } elseif (array_key_exists('altType', $this->data)) {
            $altType = $this->data['altType'];
        } else {
            throw new InvalidGeoJsonException();
        }

        return ucfirst(strtolower($altType));
    }

    /**
     * @param integer $flag Flag.
     *
     * @return void
     */
    private function setFlag($flag)
    {
        $this->flags |= $flag;
    }

    /**
     * @param integer $flag Flag.
     *
     * @return boolean
     */
    private function isFlagSet($flag)
    {
        return ($this->flags & $flag) > 0;
    }

    /**
     * @param integer $flag Flag.
     *
     * @return void
     */
    private function unsetFlag($flag)
    {
        $this->flags &= ~ $flag;
    }

    /**
     * Split fields on two group, in one all fields exists in
     * government entity. Second group contains new fields.
     *
     * @param array $fields Array of fields from processing file.
     *
     * @return array
     */
    private function collectMetadata(array $fields)
    {
        /*
         * Get metadata for government table.
         */
        $governmentMetadata = $this->em
            ->getClassMetadata('GovWikiDbBundle:Government');
        /*
         * Government entity fields name, in camel case like it
         * describe in Entity\Government.php.
         */
        $governmentFields = $governmentMetadata->getFieldNames();

        /*
         * Government table fields name, in snake case like column name in
         * db table.
         */
        $governmentTableFields = array_map(function ($value) {

            $value = lcfirst($value);
            /*
             * Replace all uppercase character and digit which taken place after
             * lowercase characters.
             */
            $value = preg_replace(
                '/(?(?<=[a-z])[A-Z0-9]|[A-Z])/',
                '_$0',
                $value
            );

            return strtolower($value);
        }, $governmentFields);

        /*
         * Relation between entity and table field names.
         */
        $governmentFieldsMap = array_combine(
            $governmentTableFields,
            $governmentFields
        );

        /*
         * List of all government fields name, for processing
         * file fields array.
         */
        $governmentFields = array_merge(
            $governmentFields,
            $governmentTableFields
        );

        $metadata = [
            'government' => [],
            'extended' => [],
        ];
        foreach ($fields as $field => $value) {
            if (! in_array($field, $governmentFields, true)) {
                /*
                 * Field not exists in government entity, add to environment
                 * related government table.
                 */
                $metadata['govColumns'][] = $field;

                if (preg_match('|_?[Rr]ank$|', $field)) {
                    /*
                     * Ranked field.
                     */
                    $name = preg_replace('|_?[Rr]ank$|', '', $field);

                    $metadata['extended'][$name]['ranked'] = true;
                } else {
                    /*
                     * Normal field.
                     * Find out field type, by default assume that field have
                     * string type.
                     */
                    $type = 'string';
                    if (is_float($value)) {
                        $type = 'float';
                    } elseif (is_int($value) || preg_match('/^\d+$/', $value)) {
                        $type = 'integer';
                    }

                    $metadata['extended'][$field]['type'] = $type;
                }
            } else {
                /*
                 * Field from government entity.
                 */
                $metadata['government'][$field]['type'] =
                    $governmentMetadata
                        ->getTypeOfField($governmentFieldsMap[$field]);
            }
        }

        return $metadata;
    }

    /**
     * @return void
     *
     * @throws \Exception While processing transaction.
     * @throws \Doctrine\DBAL\DBALException Some error while insert governments.
     * @throws \InvalidArgumentException Invalid column type.
     * @throws \Doctrine\DBAL\ConnectionException If the commit failed due to no
     * active transaction or because the transaction was marked for rollback
     * only.
     */
    private function update()
    {
        /*
         * Add new data to our database.
         */

        $con = $this->em->getConnection();
        $environment = $this->environment->getSlug();

        try {
            $con->beginTransaction();

            /*
             * Add governments.
             */
            $con->exec('
                    INSERT IGNORE INTO governments
                        (environment_id, county, slug, alt_type_slug, '.
                implode(',', array_keys($this->metadata['government']))
                .') VALUES ' . implode(',', $this->sqls['db']));

            if (! $this->isMetadataUpdated) {
                /*
                 * Create columns.
                 */
                $tableFields = [];
                $formats = [];

                $this->envRelatedGovernmentFields = [];
                foreach ($this->metadata['extended'] as $field => $data) {
                    /*
                     * Generate formats table sqls.
                     */
                    $slug = Format::slugifyName($field);
                    $ranked = (array_key_exists('ranked', $data) && $data['ranked']) ? 1 : 0;

                    $formats[] = "
                        ('{$field}', '{$slug}', 'a:0:{}', 'data', {$ranked}, '{$data['type']}', {$this->environment->getId()})
                ";

                    /*
                     * Generate alter table sqls for environment related government
                     * table.
                     */
                    $type = GovernmentTableManager::resolveType($data['type']);
                    $tableFields[] = "ADD {$field} {$type} DEFAULT NULL";

                    $this->envRelatedGovernmentFields[] = $field;
                    if ($ranked) {
                        $this->envRelatedGovernmentFields[] = $field . '_rank';
                        $tableFields[] = "ADD {$field}_rank int(11) DEFAULT NULL";
                    }
                }

                /*
                 * Insert new formats and update environment related government
                 * table.
                 */
                $con->exec('
                    INSERT INTO formats
                        (name, field, show_in, data_or_formula, ranked, type, environment_id)
                    VALUES ' . implode(',', $formats));
                $con->exec(
                    "ALTER TABLE `{$environment}` " . implode(',', $tableFields)
                );
                $this->isMetadataUpdated = true;
            }

            /*
             * Pull environment related government with table extended
             * properties values.
             */
            $con->exec("
                INSERT IGNORE INTO {$environment} (government_id, " .
                implode(',', $this->envRelatedGovernmentFields) . ') VALUES ' .
                implode(',', $this->sqls['government']));
        } catch (\Exception $e) {
            $con->rollBack();
            throw $e;
        }
        $con->commit();

        /*
         * Add information to CartoDB dataset.
         */
        $this->api->sqlRequest("
                INSERT INTO {$environment}
                    (the_geom, alt_type_slug, slug)
                VALUES " . implode(',', $this->sqls['cartodb']));

        $this->sqls['db'] = [];
        $this->sqls['cartodb'] = [];
        $this->sqls['government'] = [];
    }

    /**
     * @param string $column Column name from geojson file.
     * @param array  $data   Metadata for column returned by
     *                       {@see GeoJsonStreamListener::collectMetadata}.
     *
     * @return mixed
     */
    private function getFieldValueFromData($column, array $data)
    {
        $value = $this->data[$column];

        if (null === $value) {
            $value = 'NULL';
        } elseif (array_key_exists('type', $data) &&
            ('string' === $data['type'])) {
            $value = '\'' . addslashes($value) . '\'';
        }

        return $value;
    }
}
