<?php

namespace GovWiki\DbBundle\Doctrine\Type\ColoringConditions;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;

/**
 * Class ColoringConditions
 * @package GovWiki\DbBundle\Doctrine\Type\ColoringConditions
 */
class ColoringConditions
{
    /**
     * @var string
     */
    private $fieldName;

    /**
     * @var Collection
     */
    private $conditions;

    /**
     * @var boolean
     */
    private $colorized = false;

    /**
     * @param string $fieldName Government field name which used to decides
     *                          which color is used base on this field values
     *                          for concrete county.
     */
    public function __construct($fieldName = null)
    {
        $this->fieldName = $fieldName;
        $this->conditions = new ArrayCollection();
    }

    /**
     * Array representation of object.
     *
     * @return array
     */
    public function toArray()
    {
        $conditions = [];
        /** @var ConditionInterface $condition */
        foreach ($this->conditions as $condition) {
            $conditions[] = $condition->toArray();
        }

        return [
            'colorized' => $this->colorized,
            'fieldName' => $this->fieldName,
            'conditions' => $conditions,
        ];
    }

    /**
     * @param array $array Serialized colorized county conditions data.
     *
     * @return ColoringConditions
     */
    public static function fromArray(array $array)
    {
        /*
         * Check array keys and value types.
         */
        if (! array_key_exists('fieldName', $array) ||
            ! array_key_exists('conditions', $array) ||
            ! array_key_exists('colorized', $array) ||
            ! is_string($array['fieldName']) ||
            ! is_array($array['conditions']) ||
            ! is_bool($array['colorized'])) {
            throw new \InvalidArgumentException(
                'Wrong serialized data, expect array with two keys: \'fieldName\' with string value, \'conditions\' with array value and \'colorized\' with boolean value.'
            );
        }

        /*
         * Create new instance and fill by conditions.
         */
        $object = new ColoringConditions($array['fieldName']);
        $object->setColorized($array['colorized']);

        /*
         * Pull conditions to object, previously sort in reverse order.
         */
        $conditions = $array['conditions'];
        foreach ($conditions as $condition) {
            switch ($condition['type']) {
                case SimpleCondition::getType():
                    $entity = SimpleCondition::fromArray($condition);
                    break;

                case PeriodCondition::getType():
                    $entity = PeriodCondition::fromArray($condition);
                    break;

                case NullCondition::getType():
                    $entity = NullCondition::fromArray($condition);
                    break;

                default:
                    continue 2;
            }

            $object->addCondition($entity);
        }

        return $object;
    }

    /**
     * Serialize.
     *
     * @return string
     */
    public function serialize()
    {
        return serialize($this->toArray());
    }

    /**
     * Unserialize.
     *
     * @param string $serializedData Data serialized by
     *                               {@see ColorizedCountyCondition::serialize}.
     *
     * @return ColoringConditions
     *
     * @throws \InvalidArgumentException Wrong data given.
     */
    public static function unserialize($serializedData)
    {
        $array = unserialize($serializedData);
        if (! is_array($array)) {
            return new ColoringConditions();
        }

        return self::fromArray($array);
    }

    /**
     * @return string
     */
    public function getFieldName()
    {
        return $this->fieldName;
    }

    /**
     * @param string $fieldName Government field name which used to decides
     *                          which color is used base on this field values
     *                          for concrete county.
     *
     * @return ColoringConditions
     */
    public function setFieldName($fieldName)
    {
        $this->fieldName = $fieldName;

        return $this;
    }

    /**
     * @return Collection
     */
    public function getConditions()
    {
        return $this->conditions;
    }

    /**
     * Add new color condition.
     *
     * @param ConditionInterface $condition A Condition instance.
     *
     * @return ColoringConditions
     */
    public function addCondition(ConditionInterface $condition)
    {
        $this->conditions[] = $condition;

        return $this;
    }

    /**
     * Remove condition.
     *
     * @param ConditionInterface $condition A Condition instance.
     *
     * @return $this
     */
    public function removeCondition(ConditionInterface $condition)
    {
        $this->conditions->removeElement($condition);

        return $this;
    }

    /**
     * @return boolean
     */
    public function isColorized()
    {
        return $this->colorized;
    }

    /**
     * @param boolean $colorized Flag.
     *
     * @return $this
     */
    public function setColorized($colorized)
    {
        $this->colorized = $colorized;

        return $this;
    }
}
