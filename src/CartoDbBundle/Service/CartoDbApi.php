<?php

namespace CartoDbBundle\Service;

use CartoDbBundle\Exception\CartoDBRequestFailException;

/**
 * Wrapper under carto db api.
 *
 * @package GovWiki\CartoDbBundle\Service
 */
class CartoDbApi
{
    /**
     * @var string
     */
    private $apiKey;

    /**
     * @var string
     */
    private $endpoint;

    /**
     * @param string $apiKey  CartoDB api key.
     * @param string $account CartoDB account name.
     */
    public function __construct($apiKey, $account)
    {
        $this->apiKey = $apiKey;
        $this->endpoint = "https://{$account}.cartodb.com/api";
    }

    /**
     * Send file with data to CartoDB.
     *
     * @param string  $filePath     Path to GeoJson data file.
     * @param boolean $createNewMap If set create new 'Unnamed map'.
     *
     * @return string Item queue id.
     *
     * @throws CartoDBRequestFailException Fail request.
     */
    public function importDataset($filePath, $createNewMap = false)
    {
        $uri = '/v1/imports';
        if ($createNewMap) {
            $uri .= '?create_vis=true';
        }
        $filePath = realpath($filePath);

        $response = $this
            ->makeRequest($uri, 'POST', [ 'file' => "@{$filePath}" ]);

        if (array_key_exists('success', $response)
            && $response['success'] === true) {
            return $response['item_queue_id'];
        }

        throw new CartoDBRequestFailException($response);
    }

    /**
     * Check import status by using item queue id returned from
     * {@see CartoDbApi::importDataset}.
     *
     * @param string $itemQueueId Carto db item queue id.
     *
     * @return array
     *
     * @throws CartoDBRequestFailException Fail request.
     */
    public function checkImportProcess($itemQueueId)
    {
        $response = $this->makeRequest("/v1/imports/{$itemQueueId}");

        if (array_key_exists('success', $response)
            && $response['success'] === true) {
            return $response;
        }

        throw new CartoDBRequestFailException($response);
    }

    /**
     * Fetch visualization url from response.
     *
     * @param array $response Response from
     *                        {@see CartoDbApi::checkImpostProcess}.
     *
     * @return string
     */
    public function getVizUrl(array $response)
    {
        if (array_key_exists('visualization_id', $response) &&
            'complete' === $response['state']) {
            $vizId = $response['visualization_id'];
            return "{$this->endpoint}/v2/viz/{$vizId}/viz.json";
        }

        return null;
    }

    /**
     * @param string $name Dataset name.
     *
     * @return CartoDbApi
     */
    public function dropDataset($name)
    {
        $this->makeRequest("/v2/sql", 'GET', [
            'q' => "DROP TABLE {$name}",
        ]);

        return $this;
    }

    /**
     * Wrapper under curl for making request to api.
     *
     * @param string $uri        Relative to CartoDB api end point.
     * @param string $method     Http method.
     * @param array  $parameters Request parameters.
     *
     * @return array
     */
    private function makeRequest($uri, $method = 'GET', array $parameters = [])
    {
        $method = strtoupper($method);

        if (strpos($uri, '?') === false) {
            $uri .= "?api_key={$this->apiKey}";
        } else {
            $uri .= "&api_key={$this->apiKey}";
        }

        $handler = curl_init("{$this->endpoint}${uri}");

        curl_setopt($handler, CURLOPT_RETURNTRANSFER, true);

        if ('GET' !== $method) {
            curl_setopt($handler, CURLOPT_POST, true);
        }
        if (count($parameters) > 0) {
            curl_setopt($handler, CURLOPT_POSTFIELDS, $parameters);
        }

        $response = curl_exec($handler);
        curl_close($handler);

        return json_decode($response, true);
    }
}
