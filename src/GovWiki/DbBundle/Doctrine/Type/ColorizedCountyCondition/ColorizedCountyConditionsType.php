<?php

namespace GovWiki\DbBundle\Doctrine\Type\ColorizedCountyCondition;

use Doctrine\DBAL\Platforms\AbstractPlatform;
use Doctrine\DBAL\Types\Type;

/**
 * Class ColorizedCountyConditionsType
 */
class ColorizedCountyConditionsType extends Type
{
    /**
     * {@inheritdoc
     */
    public function getName()
    {
        return 'ColorizedCountyConditions';
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
        if ($value instanceof ColorizedCountyConditions) {
            return $value->serialize();
        }

        return $value;
    }

    /**
     * {@inheritdoc}
     */
    public function convertToPHPValue($value, AbstractPlatform $platform)
    {
        return ColorizedCountyConditions::unserialize($value);
    }
}
