<?php

namespace CartoDbBundle\Utils;

/**
 * Class NamedMap
 * @package CartoDbBundle\Utils
 */
class NamedMap
{
    /**
     * @var string
     */
    private $name;

    /**
     * @var float
     */
    private $latitude;

    /**
     * @var float
     */
    private $longitude;

    /**
     * @var integer
     */
    private $zoom;

    /**
     * @var array[]
     */
    private $layers;

    /**
     * @param string $name Map template name.
     */
    public function __construct($name)
    {
        $this->name = $name;
    }

    /**
     * @return string
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * @return float
     */
    public function getLatitude()
    {
        return $this->latitude;
    }

    /**
     * @param float $latitude Latitude of map center.
     *
     * @return NamedMap
     */
    public function setLatitude($latitude)
    {
        $this->latitude = $latitude;

        return $this;
    }

    /**
     * @return float
     */
    public function getLongitude()
    {
        return $this->longitude;
    }

    /**
     * @param float $longitude Longitude of map center.
     *
     * @return NamedMap
     */
    public function setLongitude($longitude)
    {
        $this->longitude = $longitude;

        return $this;
    }

    /**
     * @return integer
     */
    public function getZoom()
    {
        return $this->zoom;
    }

    /**
     * @param integer $zoom Map zoom.
     *
     * @return NamedMap
     */
    public function setZoom($zoom)
    {
        $this->zoom = $zoom;

        return $this;
    }

    /**
     * Add layer with polygons.
     *
     * @param string $sql           Sql query for data fetching from cartodb.
     * @param string $color         Point colors.
     * @param array  $interactivity Interactivity values.
     *
     * @return NamedMap
     */
    public function addPolygonLayer($sql, $color, array $interactivity = [])
    {
        $this->layers[] = [
            'type' => 'cartodb',
            'options' => [
                'cartocss_version' => '2.1.1',
                'cartocss' => "#layer {
                    polygon-fill: {$color};
                    polygon-opacity: 0.7;
                    line-color: #FFF;
                    line-width: 0.5;
                    line-opacity: 1;
                }",
                'sql' => $sql,
                'interactivity' => $interactivity,
            ],
        ];

        return $this;
    }

    /**
     * Add layer with markers.
     *
     * @param string $sql           Sql query for data fetching from cartodb.
     * @param string $color         Point colors.
     * @param array  $interactivity Interactivity values.
     *
     * @return NamedMap
     */
    public function addLayer($sql, $color, array $interactivity = [])
    {
        $this->layers[] = [
            'type' => 'cartodb',
            'options' => [
                'cartocss_version' => '2.1.1',
                'cartocss' => "#layer { marker-fill: {$color}; }",
                'sql' => $sql,
                'interactivity' => $interactivity,
            ],
        ];

        return $this;
    }

    /**
     * @return string
     */
    public function toJson()
    {
        return json_encode([
            'version' => '0.0.1',
            'name' => $this->name,
            'auth' => [
                'method' => 'open',
            ],
            'layergroup' => [ 'layers' => $this->layers ],
            'view' => [
                'zoom' => $this->zoom,
                'center' => [
                    'lng' => $this->longitude,
                    'lat' => $this->latitude,
                ],
            ]
        ]);
    }
}
