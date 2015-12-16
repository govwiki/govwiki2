<?php

namespace CartoDbBundle\Exception;

/**
 * Class CartoDBRequestFailException
 * @package CartoDbBundle\Exception
 */
class CartoDBRequestFailException extends CartoDBException
{
    /**
     * @param string $response Response from CartoDB api.
     */
    public function __construct($response)
    {
        parent::__construct(
            'Request fail. Response from Carto DB api: '. json_encode($response)
        );
    }
}
