<?php

namespace GovWiki\DbBundle\Utils;

/**
 * Class LatLng
 * @package GovWiki\DbBundle\Utils
 */
class LatLng
{
    /**
     * @var float
     */
    public $latitude;

    /**
     * @var float
     */
    public $longitude;

    /**
     * @param float $latitude
     * @param float $longitude
     */
    public function __construct($latitude, $longitude)
    {
        $this->latitude = $latitude;
        $this->longitude = $longitude;
    }

    /**
     * @return string
     */
    public function __toString()
    {
        return "$this->latitude, $this->longitude";
    }
}
