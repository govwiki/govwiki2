<?php

namespace GovWiki\DbBundle\Doctrine\Type\ColoringConditions;

use Doctrine\DBAL\Platforms\AbstractPlatform;
use Doctrine\DBAL\Types\Type;

/**
 * Class ColoringConditionsType
 * @package GovWiki\DbBundle\Doctrine\Type\ColoringConditions
 */
class ColoringConditionsType extends Type
{
    /**
     * {@inheritdoc
     */
    public function getName()
    {
        return 'ColoringConditions';
    }

    /**
     * {@inheritdoc}
     */
    public function getSQLDeclaration(array $fieldDeclaration, AbstractPlatform $platform)
    {
        return $platform->getClobTypeDeclarationSQL($fieldDeclaration);
    }

    /**
     * {@inheritdoc}
     */
    public function convertToDatabaseValue($value, AbstractPlatform $platform)
    {
        if ($value instanceof ColoringConditions) {
            return $value->serialize();
        }

        return $value;
    }

    /**
     * {@inheritdoc}
     */
    public function convertToPHPValue($value, AbstractPlatform $platform)
    {
        try {
            return ColoringConditions::unserialize($value);
        } catch (\InvalidArgumentException $e) {
            // Some error while unserialize Colorized conditions.
            return new ColoringConditions();
        }
    }
}
