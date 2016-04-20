<?php

namespace GovWiki\DbBundle\Doctrine\Type\ColoringConditions;

/**
 * Interface ConditionInterface
 * @package GovWiki\DbBundle\Doctrine\Type\ColoringConditions
 */
interface ConditionInterface
{
    /**
     * Array representation of object.
     *
     * @return array
     */
    public function toArray();

    /**
     * @param array $data Data serialized by
     *                    {@see ConditionInterface::toArray}.
     *
     * @return ConditionInterface
     *
     * @throws \InvalidArgumentException Invalid array, see exception message
     * for explanation.
     */
    public static function fromArray(array $data);

    /**
     * Get current condition type
     *
     * @return string
     */
    public static function getType();
}
