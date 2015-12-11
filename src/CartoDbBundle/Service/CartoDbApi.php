<?php

namespace CartoDbBundle\Service;
use CartoDbBundle\Exception\CartoDBRequestFailException;

/**
 * Class CartoDbApi
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
        $this->endpoint = "https://{$account}.cartodb.com/api/v1";
    }

    /**
     * Return item queue id.
     *
     * @param string $filePath Path to GeoJson data file.
     *
     * @return string
     *
     * @throws CartoDBRequestFailException Fail request.
     */
    public function importDataset($filePath)
    {
        $response = $this
            ->makeRequest('/imports', 'POST', [ 'file' => "@{$filePath}" ]);

        if (array_key_exists('success', $response)
            && $response['success'] === true) {
            return $response['item_queue_id'];
        }

        throw new CartoDBRequestFailException($response);
    }

    /**
     * @param string $itemQueueId Carto db item queue id.
     *
     * @return array
     *
     * @throws CartoDBRequestFailException Fail request.
     */
    public function checkImportProcess($itemQueueId)
    {
        $response = $this->makeRequest("/imports/{$itemQueueId}");

        if (array_key_exists('success', $response)
            && $response['success'] === true) {
            return $response;
        }

        throw new CartoDBRequestFailException($response);
    }

    /**
     * @param string $uri        Relative to CartoDB api end point.
     * @param string $method     Http method.
     * @param array  $parameters Request parameters.
     *
     * @return array
     */
    private function makeRequest($uri, $method = 'GET', array $parameters = [])
    {
        $method = strtoupper($method);

        if ('get' === $method) {
            $parameters = array_merge(
                $parameters,
                [ 'api_key' => $this->apiKey ]
            );
        } else {
            $uri .= "?api_key={$this->apiKey}";
        }

        $handler = curl_init("{$this->endpoint}${uri}");

        curl_setopt_array($handler, [
            CURLOPT_CUSTOMREQUEST => $method,
            CURLOPT_RETURNTRANSFER => 1,
            CURLOPT_POSTFIELDS => $parameters,
        ]);

        $response = curl_error($handler);
        curl_close($handler);

        return json_decode($response, true);
    }
}
