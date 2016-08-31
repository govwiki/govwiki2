<?php

namespace GovWiki\EnvironmentBundle\Converter;

/**
 * Class DataTypeConverter
 * @package GovWiki\EnvironmentBundle\Converter
 */
final class DataTypeConverter
{

    /**
     * {@inheritdoc}
     */
    public static function abstract2database($type)
    {
        switch (strtolower($type)) {
            case 'string':
                return 'VARCHAR(255)';

            case 'integer':
                return 'INT(11)';

            case 'float':
                return 'FLOAT';
        }

        return null;
    }

    /**
     * {@inheritdoc}
     */
    public static function database2abstract($type)
    {
        $type = strtolower($type);

        switch (true) {
            case (strpos($type, 'varchar') !== false):
                return 'string';

            case (strpos($type, 'int') !== false):
                return 'integer';

            case (strpos($type, 'float') !== false)
                || (strpos($type, 'decimal') !== false)
                || (strpos($type, 'double') !== false):
                return 'float';
        }

        return null;
    }
}
