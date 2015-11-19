<?php

namespace GovWiki\ApiBundle\Serializer;

use JMS\Serializer\Metadata\PropertyMetadata;
use JMS\Serializer\Naming\PropertyNamingStrategyInterface;

/**
 * Class GovWikiNamingStrategy
 * @package GovWiki\ApiBundle\Serializer
 */
class GovWikiNamingStrategy implements PropertyNamingStrategyInterface
{
    /**
     * {@inheritDoc}
     */
    public function translateName(PropertyMetadata $property)
    {
        return strtolower(preg_replace('/([A-Z]|[0-9]+)/', '_\\0', $property->name));
    }
}
