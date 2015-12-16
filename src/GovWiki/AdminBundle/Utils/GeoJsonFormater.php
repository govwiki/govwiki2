<?php

namespace GovWiki\AdminBundle\Utils;

/**
 * Class GeoJsonFormater
 * @package GovWiki\AdminBundle\Utils
 */
final class GeoJsonFormater
{
    /**
     * @param array $data Array of point with required field 'latitude' and
     *                    'longitude'.
     *
     * @return string
     */
    public static function format(array $data)
    {
        $result = [
            'type' => 'FeatureCollection',
            'features' => [],
        ];

        foreach ($data as $row) {
            $feature = [
                'type' => 'Feature',
                'geometry' => [
                    'type' => 'Point',
                    'coordinates' => [ $row['longitude'], $row['latitude'] ],
                ],
            ];

            unset($row['latitude'], $row['longitude']);

            $feature['properties'] = $row;
            $result['features'][] = $feature;
        }

        return json_encode($result);
    }
}
