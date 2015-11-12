<?php

namespace GovWiki\ApiBundle\Serializer;

use JMS\Serializer\GenericDeserializationVisitor;

/**
 * Class ArrayDeserializationVisitor
 * @package GovWiki\ApiBundle\Serializer
 * @author Aurimas Niekis <aurimas.niekis@gmail.com>
 */
class ArrayDeserializationVisitor extends GenericDeserializationVisitor
{
    protected function decode($str)
    {
        return $str;
    }
}
