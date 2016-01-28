<?php

namespace GovWiki\DbBundle\Doctrine\Type\ColorizedCountyCondition;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;

/**
 * Class ColorizedCountyConditions
 */
class ColorizedCountyConditions
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
    public function __construct($fieldName = ' ')
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
        foreach ($this->conditions as $condition) {
            $conditions[$condition->getCondition()] = $condition->getColor();
        }

        if ($conditions) {
            krsort($conditions);
        }

        return [
            'colorized' => $this->colorized,
            'fieldName' => $this->fieldName,
            'conditions' => $conditions,
        ];
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
     * @return ColorizedCountyConditions
     *
     * @throws \InvalidArgumentException Wrong data given.
     */
    public static function unserialize($serializedData)
    {
        $array = unserialize($serializedData);

        if (! is_array($array) || count($array) === 0) {
            /*
             * Return default.
             */
            return new ColorizedCountyConditions();
        }

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
                'Wrong serialized data, expect array with two keys: \'fieldName\' with string value, \'conditions\' with array value and \'isColorized\' with boolean value.'
            );
        }

        /*
         * Create new instance and fill by conditions.
         */
        $object = new ColorizedCountyConditions($array['fieldName']);
        $object->setColorized($array['colorized']);

        /*
         * Pull conditions to object, previously sort in reverse order.
         */
        $conditions = $array['conditions'];
        krsort($conditions);
        foreach ($conditions as $condition => $color) {
            $object->addCondition(new Condition($condition, $color));
        }

        return $object;
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
     * @return ColorizedCountyConditions
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
     * @param Condition $condition A Condition instance.
     *
     * @return ColorizedCountyConditions
     */
    public function addCondition(Condition $condition)
    {
        $this->conditions[] = $condition;

        return $this;
    }

    /**
     * Remove condition.
     *
     * @param Condition $condition A Condition instance.
     *
     * @return $this
     */
    public function removeCondition(Condition $condition)
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
