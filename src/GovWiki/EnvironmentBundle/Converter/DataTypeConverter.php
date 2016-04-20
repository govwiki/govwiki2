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
        switch ($type) {
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
        switch (strtolower($type)) {
            case 'varchar(255)':
                return 'string';

            case 'int(11)':
                return 'integer';

            case 'float':
                return 'float';
        }

        return null;
    }
}
