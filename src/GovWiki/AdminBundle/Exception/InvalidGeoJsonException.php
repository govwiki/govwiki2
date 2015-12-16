<?php

namespace GovWiki\AdminBundle\Exception;

/**
 * Class InvalidGeoJsonException
 * @package GovWiki\AdminBundle\Exception
 */
class InvalidGeoJsonException extends FileTransformerException
{
    /**
     * @param array $geoJsonData Invalid data.
     */
    public function __construct(array $geoJsonData)
    {
        parent::__construct('Invalid geo json in ' . json_encode($geoJsonData));
    }
}
