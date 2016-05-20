<?php

namespace CartoDbBundle\Service;

/**
 * Wrapper under CartoDB api.
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
     * @param string  $name      Dataset name.
     * @param array   $fields    Array of dataset field where key is field name
     *                           and value if field type.
     * @param boolean $temporary Flag, if set don't cartodbfy.
     *
     * @return array
     */
    public function createDataset($name, array $fields = [], $temporary = false)
    {
        $sqlParts = [];
        foreach ($fields as $field => $type) {
            $sqlParts[] = $field .' '. $type;
        }

        $response = $this->sqlRequest("CREATE TABLE {$name} (". implode(',', $sqlParts) .
            ')');

        if (self::getErrorFromResponse($response)) {
            return $response;
        }

        if (! $temporary) {
            $response = $this->sqlRequest("SELECT cdb_cartodbfytable('{$name}')");
        }

        return $response;
    }

    /**
     * @param string $name Dataset name.
     *
     * @return CartoDbApi
     */
    public function dropDataset($name)
    {
        $this->sqlRequest("DROP TABLE IF EXISTS {$name}");

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
     * @param array $response Response from CartoDB.
     *
     * @return string|null
     */
    public static function getErrorFromResponse(array $response)
    {
        if (array_key_exists('error', $response)) {
            return $response['error'][0];
        }

        return null;
    }


    /**
     * Restore dataset from backup.
     *
     * @param string $dataset Main dataset name.
     * @param string $backup  Backup dataset name.
     *
     * @return null|string
     */
    public function restore($dataset, $backup)
    {
        // Clean dataset.
        $response = $this->sqlRequest("DELETE FROM {$dataset}");

        $error = self::getErrorFromResponse($response);
        if ($error) {
            return $error;
        }

        // Restore old values.
        $response = $this->sqlRequest("
            INSERT INTO {$dataset}
            SELECT * FROM {$backup}
        ");

        $error = self::getErrorFromResponse($response);
        if ($error) {
            return $error;
        }

        return null;
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
