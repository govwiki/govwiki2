<?php

namespace CartoDbBundle\Service;

use CartoDbBundle\Exception\CartoDBRequestFailException;
use CartoDbBundle\Utils\NamedMap;
use Symfony\Component\Routing\RouterInterface;

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
     * @var string
     */
    private $host;

    /**
     * @param string $apiKey  CartoDB api key.
     * @param string $account CartoDB account name.
     */
    public function __construct($apiKey, $account, RouterInterface $router)
    {
        $this->apiKey = $apiKey;
        $this->endpoint = "https://{$account}.cartodb.com/api";
        $this->host = $router->getContext()->getHost();
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
     *
     * @deprecated
     */
    public function importDataset($filePath, $createNewMap = false)
    {
        $uri = '/v1/imports';
        if ($createNewMap) {
            $uri .= '?create_vis=true';
        }
//        $filename = substr($filePath, strrpos($filePath, '/') + 1);
//        $newFilePath = __DIR__ . '/../../../web/img/'. $filename;
//
//        rename($filePath, $newFilePath);
//
//        $data = json_encode([ 'url' => "http://{$this->host}/img/{$filename}"]);
//
//        $response = $this
//            ->makeRequest($uri, 'POST', [
//                'curl' => [
//                    CURLOPT_POSTFIELDS => $data,
//                    CURLOPT_HTTPHEADER => [
//                        'Content-Type: application/json',
//                        'Content-Length: ' . strlen($data),
//                    ],
//                ],
//            ]);

        $filePath = realpath($filePath);

        $response = $this
            ->makeRequest($uri, 'POST', [
                'file' => "@{$filePath}",
                'curl' => [
                    CURLOPT_HTTPHEADER => [
                        'Content-Type: multipart/form-data',
                    ],
                ],
            ]);
        unlink($filePath);

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

        if (array_key_exists('success', $response)) {
            return $response;
        }

        return [];
    }

    /**
     * Fetch visualization url from response.
     *
     * @param array $response Response from
     *                        {@see CartoDbApi::checkImpostProcess}.
     *
     * @return string
     *
     * @deprecated
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
     * @param NamedMap $map A NamedMap instance.
     *
     * @return array
     */
    public function createMap(NamedMap $map)
    {
        $data = $map->toJson();

        return $this->makeRequest('/v1/map/named', 'POST', [
            'curl' => [
                CURLOPT_HTTPHEADER => [
                    'Content-Type: application/json',
                    'Content-Length: '. strlen($data),
                ],
                CURLOPT_POSTFIELDS => $data,
            ],
        ]);
    }

    /**
     * Remove named map.
     *
     * @param string $name Map name.
     *
     * @return array
     */
    public function deleteMap($name)
    {
        return $this->makeRequest("/v1/map/named/{$name}", 'DELETE');
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
            'curl' => [ CURLOPT_POST => 'true' ],
        ]);
    }

    /**
     * todo annotate
     *
     * @param string $name   Dataset name.
     * @param array  $fields Array of dataset field where key is field name and
     *                       value if field type.
     *
     * @return CartoDbApi
     */
    public function createDataset($name, array $fields = [], $temporary = false)
    {
        $sqlParts = [];
        foreach ($fields as $field => $type) {
            $sqlParts[] = $field .' '. $type;
        }

        $this->sqlRequest("CREATE TABLE {$name} (". implode(',', $sqlParts) .
            ')');
        if (! $temporary) {
            $this->sqlRequest("SELECT cdb_cartodbfytable('{$name}')");
        }

        return $this;
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
     * @param string $string String for escaping.
     *
     * @return string
     */
    public static function escapeString($string)
    {
        return str_replace([ "'" ], [ "''" ], $string);
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

        curl_setopt_array($handler, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_VERBOSE => false,
        ]);

        if ('GET' !== $method) {
//            curl_setopt($handler, CURLOPT_POST, true);
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
