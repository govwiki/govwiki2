<?php

namespace GovWiki\DbBundle\Doctrine\Type\ColorizedCountyCondition;

/**
 * Class NullCondition
 * @package GovWiki\DbBundle\Doctrine\Type\ColorizedCountyCondition
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
