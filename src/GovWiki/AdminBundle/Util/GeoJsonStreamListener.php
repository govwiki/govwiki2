<?php
namespace GovWiki\AdminBundle\Util;

use CartoDbBundle\Service\CartoDbApi;
use Doctrine\ORM\EntityManagerInterface;
use GovWiki\AdminBundle\Exception\InvalidGeoJsonException;
use GovWiki\AdminBundle\Manager\AbstractAdminEntityManager;
use GovWiki\AdminBundle\Manager\Entity\AdminGovernmentManager;
use GovWiki\DbBundle\Entity\Environment;
use GovWiki\DbBundle\Entity\Government;

/**
 * Class GeoJsonStreamListener
 * @package GovWiki\AdminBundle\Util
 */
class GeoJsonStreamListener implements \JsonStreamingParser_Listener
{
    /**
     * @var boolean
     */
    private $onInitialStage = true;

    /**
     * @var boolean
     */
    private $inGeometry = false;

    /**
     * @var boolean
     */
    private $inCoordinates = false;

    /**
     * @var boolean
     */
    private $buildProperties = false;

    /**
     * @var string
     */
    private $currentKey;

    /**
     * @var Environment
     */
    private $environment;

    /**
     * @var EntityManagerInterface
     */
    private $em;

    /**
     * @var array
     */
    private $data;

    /**
     * @var CartoDbApi
     */
    private $api;

    /**
     * @var array
     */
    private $sql = [];

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
     */
    public function end_document()
    {
        if (count($this->sql) > 0) {
            $this->api->sqlRequest("
                INSERT INTO {$this->environment->slug}
                    (id, the_geom, alt_type_slug, slug)
                VALUES " . implode(',', $this->sql)
            );
        }
    }

    /**
     * @return void
     */
    public function start_array()
    {
        if (! $this->inCoordinates && ('coordinates' === $this->currentKey)) {
            $this->data['_coordinates'] = [];
            $this->data['_level'] = 0;
            $this->inCoordinates = true;
        } elseif ($this->inCoordinates) {
            $this->data['_level']++;
            $this->data['_tmp'][$this->data['_level']] = [];
        }
    }

    /**
     * @return void
     */
    public function end_array()
    {
        if ($this->inCoordinates) {
            $this->data['_level']--;
            $this->data['_tmp'][$this->data['_level']][] =
                $this->data['_tmp'][$this->data['_level'] + 1];

            if (0 === $this->data['_level']) {
                $this->data['_coordinates'] = $this->data['_tmp'][$this->data['_level']][0];
                $this->inCoordinates = false;
            }
        }
    }

    /**
     * @return void
     */
    public function start_object()
    {
        if ('geometry' === $this->currentKey) {
            $this->inGeometry = true;
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
        if ($this->buildProperties &&
            (array_key_exists('_geometry_type', $this->data)) &&
            (array_key_exists('_coordinates', $this->data))) {

            $government = new Government();

            $altType = $this->getAltType();

            $isCounty = 'Point' !== $this->data['_geometry_type'];

            $government
                ->setEnvironment($this->environment)
                ->setName($this->data['name'])
                ->setAltType($altType)
                ->setCounty($isCounty);

            $this->em->persist($government);
            $this->em->flush();

            if ($isCounty) {
                $this->data['_coordinates'][0][] = $this->data['_coordinates'][0][0];
            }

            $value = json_encode([
                'type' => $this->data['_geometry_type'],
                'coordinates' => [ $this->data['_coordinates'] ],
            ]);

            $this->sql[] =
                "({$government->getId()},ST_SetSRID(ST_GeomFromGeoJSON('$value'), 4326),".
                "'{$government->getAltTypeSlug()}','{$government->getSlug()}')";


            $this->buildProperties = false;
            $this->data = [];
        }
    }

    /**
     * @param string $key Current key.
     *
     * @return void
     */
    public function key($key)
    {
        if (! $this->onInitialStage && 'properties' === $key) {
            $this->buildProperties = true;
            $this->data = [];
        }
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
        if ('type' === $this->currentKey) {
            if ($this->onInitialStage) {
                if ('FeatureCollection' !== $value) {
                    throw new InvalidGeoJsonException();
                }

                $this->onInitialStage = false;
            } elseif ($this->inGeometry) {
                $this->data['_geometry_type'] = $value;
                $this->inGeometry = false;
            } elseif ('Feature' !== $value) {
                throw new InvalidGeoJsonException();
            }
        } elseif ($this->buildProperties) {
            if ($this->inCoordinates) {
                $this->data['_tmp'][$this->data['_level']][] = $value;
            } else {
                $this->data[$this->currentKey] = $value;
            }
        }
    }

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
}
