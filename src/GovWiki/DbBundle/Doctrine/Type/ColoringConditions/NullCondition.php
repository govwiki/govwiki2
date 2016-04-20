<?php

namespace GovWiki\DbBundle\Doctrine\Type\ColoringConditions;

/**
 * Class NullCondition
 * @package GovWiki\DbBundle\Doctrine\Type\ColoringConditions
 */
class NullCondition extends AbstractCondition
{
    /**
     * {@inheritdoc}
     */
    public static function getType()
    {
        return 'null';
    }
}
