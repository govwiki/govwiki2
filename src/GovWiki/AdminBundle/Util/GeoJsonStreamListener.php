<?php
namespace GovWiki\AdminBundle\Util;

use CartoDbBundle\Service\CartoDbApi;
use Doctrine\ORM\EntityManagerInterface;
use GovWiki\AdminBundle\Exception\InvalidGeoJsonException;
use GovWiki\AdminBundle\Manager\GovernmentTableManager;
use GovWiki\DbBundle\Entity\Environment;
use GovWiki\DbBundle\Entity\Format;
use GovWiki\DbBundle\Entity\Government;

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
     * @var EntityManagerInterface
     */
    private $em;

    /**
     * @var CartoDbApi
     */
    private $api;

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
     * @throws \Doctrine\DBAL\DBALException Some error while insert governments.
     *
     * @throws \InvalidArgumentException Invalid column type.
     * @throws \Doctrine\DBAL\ConnectionException If the commit failed due to no
     * active transaction or because the transaction was marked for rollback
     * only.
     */
    public function end_document()
    {
        if (count($this->sqls['db']) > 0) {
            /*
             * Add new data to our database.
             */

            $con = $this->em->getConnection();
            $environment = $this->environment->getSlug();

            try {
                $con->beginTransaction();
                /*
                 * Create trigger to sync governments table and environment related
                 * governments table such as 'california'.
                 */
                $con->exec("DROP TRIGGER IF EXISTS sync_{$environment}");
                $con->exec("
                    CREATE TRIGGER sync_{$environment} AFTER INSERT ON `governments`
                    FOR EACH ROW INSERT INTO {$environment} (government_id) VALUES (NEW.id)
                ");

                /*
                 * Add governments.
                 */
                $con->exec('
                INSERT INTO governments
                    (environment_id, name, slug, alt_type, alt_type_slug, county)
                VALUES ' . implode(',', $this->sqls['db']));

                /*
                 * Create columns.
                 */
                $tableFields = [];
                $formats = [];

                foreach ($this->sqls['columns'] as $field => $data) {
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
                    if ($ranked) {
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

                /*
                 * Insert into environment related government table extended
                 * properties.
                 */
                $con->exec("
                INSERT INTO {$environment} (" .
                    implode(',', array_keys($this->sqls['columns'])) . ') VALUES ' .
                    implode(',', $this->sqls['government']));

                /*
                 * Delete trigger.
                 */
                $con->exec('DROP TRIGGER sync');
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
                $isCounty = 'Point' !== $this->data['geometry_type'];
                if ($isCounty) {
                    $this->coordinates = $this->coordinates[0];
                    $this->coordinates[0][0][] = $this->coordinates[0][0][0];
                }

                /*
                 * Create GeoJson for concrete government.
                 */
                $json = json_encode([
                    'type'        => $this->data['geometry_type'],
                    'coordinates' => $this->coordinates,
                ]);

                $name = $this->data['name'];
                $slug = Government::slugifyName($name);
                $altType = $this->getAltType();
                $altTypeSlug = Government::slugifyAltType($altType);

                if (! array_key_exists('columns', $this->sqls)) {
                    /*
                     * Get extended column names that not exists in government
                     * entity.
                     */
                    $fields = $this->data;
                    $restrictedFields = [
                        'name',
                        'slug',
                        'alt_type',
                        'altType',
                        'alt_type_slug',
                        'altTypeSlug',
                        'kind',
                        'state',
                        'web_site_address',
                        'webSiteAddress',
                        'geometry_type',
                    ];

                    foreach ($fields as $field => $value) {
                        if (! in_array($field, $restrictedFields, true)) {
                            if (preg_match('|_?[Rr]ank$|', $field)) {
                                /*
                                 * Ranked field.
                                 */
                                $name = preg_replace('|_?[Rr]ank$|', '', $field);

                                $this->sqls['columns'][$name]['ranked'] = true;
                            } else {
                                /*
                                 * Normal field.
                                 * Find out field type.
                                 */
                                $type = 'string';
                                if (is_float($value)) {
                                    $type = 'float';
                                } elseif (is_int($value) || preg_match('/^\d+$/', $value)) {
                                    $type = 'integer';
                                }

                                $this->sqls['columns'][$field]['type'] = $type;
                            }
                        }
                    }

                }

                /*
                 * Add sql parts for insert into government table.
                 */
                $this->sqls['db'][] = "
                    ({$this->environment->getId()} ,'{$name}', '{$slug}', '{$altType}', '{$altTypeSlug}', {$isCounty})
                ";

                /*
                 * Add sql parts for insert into environment related government
                 * table.
                 */
                $insertParts = [];
                foreach ($this->sqls['columns'] as $column => $data) {
                    if (array_key_exists('type', $data) && ('string' === $data['type'])) {
                        $insertParts[] = '\'' . $this->data[$column] . '\'';
                    } elseif (null === $this->data[$column]) {
                        $insertParts[] = 'NULL';
                    } else {
                        $insertParts[] = $this->data[$column];
                    }
                }
                $this->sqls['government'][] = '('. implode(',', $insertParts) .')';

                /*
                 * Add sql parts for insert into CartoDB dataset.
                 */
                $this->sqls['cartodb'][] =
                    "(ST_SetSRID(ST_GeomFromGeoJSON('{$json}'), 4326)," .
                    "'{$altTypeSlug}','{$slug}')";
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
}
