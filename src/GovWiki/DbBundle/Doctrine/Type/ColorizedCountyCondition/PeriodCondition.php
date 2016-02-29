<?php

namespace GovWiki\DbBundle\Doctrine\Type\ColorizedCountyCondition;

/**
 * Class PeriodCondition
 * @package GovWiki\DbBundle\Doctrine\Type\ColorizedCountyCondition
 */
class PeriodCondition extends AbstractCondition
{
    /**
     * @var float|integer
     */
    private $min;

    /**
     * @var float|integer
     */
    private $max;

    /**
     * @param string        $color Color.
     * @param integer|float $min   Lower limit.
     * @param integer|float $max   Upper limit.
     */
    public function __construct($color, $min, $max)
    {
        parent::__construct($color);
        $this->min = $min;
        $this->max = $max;
    }

    /**
     * {@inheritdoc}
     */
    public function toArray()
    {
        return array_merge(
            parent::toArray(),
            [
                'min' => $this->min,
                'max' => $this->max,
            ]
        );
    }

    /**
     * @return float|integer
     */
    public function getMin()
    {
        return $this->min;
    }

    /**
     * @param float|integer $min Lower limit.
     *
     * @return PeriodCondition
     */
    public function setMin($min)
    {
        $this->min = $min;

        return $this;
    }

    /**
     * @return float|integer
     */
    public function getMax()
    {
        return $this->max;
    }

    /**
     * @param float|integer $max Upper limit.
     *
     * @return PeriodCondition
     */
    public function setMax($max)
    {
        $this->max = $max;

        return $this;
    }

    /**
     * {@inheritdoc}
     */
    public static function fromArray(array $data)
    {
        $entity = parent::fromArray($data);

        if (array_key_exists('min', $data) &&
            array_key_exists('max', $data) &&
            $entity instanceof PeriodCondition) {
            $entity->setMin($data['min']);
            $entity->setMax($data['max']);

            return $entity;
        }

        throw self::argumentException();
    }

    /**
     * {@inheritdoc}
     */
    public static function getType()
    {
        return 'period';
    }
}
