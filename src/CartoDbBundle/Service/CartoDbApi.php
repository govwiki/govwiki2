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
        $this->endpoint = "https://{$account}.cartodb.com/api/v1";
    }

    /**
     * Send file with data to CartoDB.
     *
     * @param string $filePath Path to GeoJson data file.
     *
     * @return string Item queue id.
     *
     * @throws CartoDBRequestFailException Fail request.
     */
    public function importDataset($filePath, $createNewMap = false)
    {
        $uri = '/imports';
        if ($createNewMap) {
            $uri .= '?create_vis=true&api_key='. $this->apiKey;
        }
        $filePath = realpath($filePath);

        $handler = curl_init($this->endpoint . $uri);
        curl_setopt_array($handler, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => [ 'file' => "@{$filePath}" ],
            CURLOPT_RETURNTRANSFER => true,
        ]);
        $response = curl_exec($handler);
        curl_close($handler);

//        $response = $this
//            ->makeRequest($uri, 'POST', [ 'file' => "@{$filePath}" ]);

        if (array_key_exists('success', $response)
            && $response['success'] === true) {
            return $response['item_queue_id'];
        }

        throw new CartoDBRequestFailException($response);
    }

    /**
     * Use item queue id returned from {@see CartoDbApi::importDataset}.
     *
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

        if ('GET' === $method) {
            /*
             * Add api key to parameters.
             */
            $parameters = array_merge(
                $parameters,
                [ 'api_key' => $this->apiKey ]
            );
        } else {
            /*
             * Add api key to query parameters.
             */
            if (strpos($uri, '?') === false) {
                $uri .= "?api_key={$this->apiKey}";
            } else {
                $uri .= "&api_key={$this->apiKey}";
            }
        }

        $handler = curl_init("{$this->endpoint}${uri}");

        if ('GET' !== $method) {
            curl_setopt($handler, CURLOPT_POST, true);
        }

        curl_setopt_array($handler, [
            CURLOPT_RETURNTRANSFER => 1,
            CURLOPT_POSTFIELDS => $parameters,
        ]);

        $response = curl_exec($handler);
        curl_close($handler);

        return json_decode($response, true);
    }
}
