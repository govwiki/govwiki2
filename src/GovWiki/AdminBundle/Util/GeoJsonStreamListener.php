<?php
namespace GovWiki\AdminBundle\Util;

use CartoDbBundle\Service\CartoDbApi;
use Doctrine\ORM\EntityManagerInterface;
use GovWiki\AdminBundle\Exception\InvalidGeoJsonException;
use GovWiki\DbBundle\Entity\Environment;
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
    private $sqls;

    /**
     * @var EntityManagerInterface
     */
    private $em;

    /**
     * @var CartoDbApi
     */
    private $api;

    /**
     * @param Environment            $environment A Environment instance.
     * @param EntityManagerInterface $em          A EntityManagerInterface
     *                                            instance.
     * @param CartoDbApi             $api         A CartoDbApi instance.
     */
    public function __construct(
        Environment $environment,
        EntityManagerInterface $em,
        CartoDbApi $api
    ) {
        $this->environment = $environment;
        $this->em = $em;
        $this->api = $api;
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
     */
    public function end_document()
    {
        if (count($this->sqls['db']) > 0) {
            /*
             * Add new data to our database.
             */

            $this->em->getConnection()->exec('
                INSERT INTO governments (environment_id, name, slug, alt_type, alt_type_slug, county)
                VALUES ' . implode(',', $this->sqls['db']));

            /*
             * Create datasets.
             */
            $this->api
                ->createDataset($this->environment->getSlug() . '_county', [
                    'alt_type_slug' => 'VARCHAR(255)',
                    'slug' => 'VARCHAR(255)',
                ]);

            $this->api
                ->createDataset($this->environment->getSlug(), [
                    'alt_type_slug' => 'VARCHAR(255)',
                    'slug' => 'VARCHAR(255)',
                ]);

            /*
             * Add information to county dataset.
             */
            $this->api->sqlRequest("
                INSERT INTO {$this->environment->getSlug()}_county
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
        if ($this->isFlagSet(self::IN_GEOMETRY) && (0 !== $this->level)) {
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
                $value = json_encode([
                    'type'        => $this->data['geometry_type'],
                    'coordinates' => $this->coordinates,
                ]);

                $name = $this->data['name'];
                $slug = Government::slugifyName($name);
                $altType = $this->getAltType();
                $altTypeSlug = Government::slugifyAltType($altType);

                /*
                 * Add sql parts for insert.
                 */
                $this->sqls['db'][] = "
                    ({$this->environment->getId()} ,'{$name}', '{$slug}', '{$altType}', '{$altTypeSlug}', {$isCounty})
                ";
                $this->sqls['cartodb'][] =
                    "(ST_SetSRID(ST_GeomFromGeoJSON('$value'), 4326)," .
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
