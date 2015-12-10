<?php

namespace GovWiki\AdminBundle\Utils;

/**
 * Class CartoDBApi
 * @package GovWiki\AdminBundle\Utils
 */
class CartoDBApi
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
     * @param string $filepath Path to GeoJson data file.
     *
     * @return array
     */
    public function importDataset($filepath)
    {
        $handler = curl_init("$this->endpoint/imports?api_key={$this->apiKey}");
        curl_setopt_array($handler, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => [ 'file' => "@{$filepath}" ],
            CURLOPT_RETURNTRANSFER => true,
        ]);
        $response = curl_exec($handler);
        curl_close($handler);

        return json_decode($response, true);
    }

    /**
     * @param string $itemQueueId Carto db item queue id.
     *
     * @return mixed
     */
    public function checkImportProcess($itemQueueId)
    {
        $handler = curl_init(
            "$this->endpoint/imports/{$itemQueueId}?api_key={$this->apiKey}"
        );
        curl_setopt_array($handler, [
            CURLOPT_RETURNTRANSFER => true,
        ]);
        $response = curl_exec($handler);
        curl_close($handler);

        return json_decode($response, true);
    }
}
