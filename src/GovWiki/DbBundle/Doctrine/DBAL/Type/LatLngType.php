<?php

namespace GovWiki\DbBundle\Doctrine\DBAL\Type;

use Doctrine\DBAL\Platforms\AbstractPlatform;
use Doctrine\DBAL\Types\Type;
use GovWiki\DbBundle\Utils\LatLng;

/**
 * Class LatLngType
 * @package GovWiki\DbBundle\DBAL\Type
 */
class LatLngType extends Type
{
    /**
     * {@inheritdoc}
     */
    public function getName()
    {
        return 'lat_lng';
    }

    /**
     * {@inheritdoc}
     */
    public function getSQLDeclaration(array $fieldDeclaration, AbstractPlatform $platform)
    {
        return 'varchar(255)';
    }

    /**
     * {@inheritdoc}
     */
    public function convertToPHPValue($value, AbstractPlatform $platform)
    {
        list($latitude, $longitude) = explode(', ', $value);
        return new LatLng($latitude, $longitude);
    }

    /**
     * {@inheritdoc}
     */
    public function convertToDatabaseValue($value, AbstractPlatform $platform)
    {
        return (string) $value;
    }
}
