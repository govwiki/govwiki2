<?php

namespace GovWiki\DbBundle\Doctrine\Type\ColorizedCountyCondition;

/**
 * Class Condition
 */
class Condition
{
    /**
     * @var float|integer
     */
    private $condition;

    /**
     * @var string
     */
    private $color;

    /**
     * @param integer|float $condition Used for colorization field value. All
     *                                 values what lower colorized in $color.
     * @param string        $color     Color value in HEX.
     */
    public function __construct($condition = null, $color = null)
    {
        $this->condition = $condition;
        $this->color = $color;
    }

    /**
     * Array representation of object.
     *
     * @return array
     */
    public function toArray()
    {
        return [ $this->condition = $this->color ];
    }

    /**
     * @return float|integer
     */
    public function getCondition()
    {
        return $this->condition;
    }

    /**
     * @param float|integer $condition Used for colorization field value. All
     *                                 values what lower colorized in $color.
     *
     * @return Condition
     */
    public function setCondition($condition)
    {
        $this->condition = $condition;

        return $this;
    }

    /**
     * @return string
     */
    public function getColor()
    {
        return $this->color;
    }

    /**
     * @param string $color Color value in HEX.
     *
     * @return Condition
     */
    public function setColor($color)
    {
        $this->color = $color;

        return $this;
    }
}
