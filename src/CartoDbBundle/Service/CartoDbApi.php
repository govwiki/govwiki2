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
     * Send geo json file to CartoDB.
     *
     * @param string  $filePath     Path to GeoJson data file.
     * @param boolean $createNewMap If set create new visualization = map.
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
     * @throws CartoDBRequestFailException Request fail.
     */
    public function checkImportProcess($itemQueueId)
    {
        $response = $this->makeRequest("/v1/imports/{$itemQueueId}");

        if ($response && array_key_exists('success', $response)) {
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
     * @param string $sql Sql statement.
     *
     * @return array
     */
    public function sqlRequest($sql)
    {
        $sql = preg_replace('|\s{2,}|', ' ', $sql);
        return $this->makeRequest('/v2/sql', 'GET', [
            'q' => $sql,
            'curl' => [ CURLOPT_POST => true ]
        ]);
    }

    /**
     * @param string $name Dataset name.
     *
     * @return CartoDbApi
     */
    public function dropDataset($name)
    {
        $this->sqlRequest("DROP TABLE {$name}");

        return $this;
    }

    /**
     * Wrapper under curl for making request to CartoDB api.
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

        $curlOptions = [];
        if (array_key_exists('curl', $parameters)) {
            $curlOptions = $parameters['curl'];
            unset($parameters['curl']);
        }

        /*
         * Add api key as query parameters.
         */
        if (strpos($uri, '?') === false) {
            $uri .= "?api_key={$this->apiKey}";
        } else {
            $uri .= "&api_key={$this->apiKey}";
        }

        $handler = curl_init("{$this->endpoint}${uri}");
        curl_setopt_array($handler, $curlOptions);

        curl_setopt($handler, CURLOPT_RETURNTRANSFER, true);

        if ('GET' !== $method) {
            curl_setopt($handler, CURLOPT_POST, true);
            curl_setopt($handler, CURLOPT_CUSTOMREQUEST, $method);
        }

        if (count($parameters) > 0) {
            curl_setopt($handler, CURLOPT_POSTFIELDS, $parameters);
        }

        $response = curl_exec($handler);
        curl_close($handler);

        return json_decode($response, true);
    }
}
