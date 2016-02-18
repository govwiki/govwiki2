<?php

namespace GovWiki\DbBundle\Doctrine\Type\ColorizedCountyCondition;

/**
 * Class SimpleCondition
 * @package GovWiki\DbBundle\Doctrine\Type\ColorizedCountyCondition
 */
class SimpleCondition extends AbstractCondition
{

    const LTE = '<=';
    const GTE = '>=';

    /**
     * @var float|integer
     */
    private $value;

    /**
     * @var string
     */
    private $operation;

    /**
     * @param string        $color     Color.
     * @param integer|float $value     Comparison value.
     * @param string        $operation Comparison operation.
     */
    public function __construct($color, $value, $operation)
    {
        parent::__construct($color);
        $this->value = $value;
        $this->operation = $operation;
    }

    /**
     * {@inheritdoc}
     */
    public function toArray()
    {
        return array_merge(
            parent::toArray(),
            [
                'value' => $this->value,
                'operation' => $this->operation,
            ]
        );
    }

    /**
     * @return float|integer
     */
    public function getValue()
    {
        return $this->value;
    }

    /**
     * @param float|integer $value Comparison value.
     *
     * @return SimpleCondition
     */
    public function setValue($value)
    {
        $this->value = $value;

        return $this;
    }

    /**
     * @return string
     */
    public function getOperation()
    {
        return $this->operation;
    }

    /**
     * @param string $operation Comparison operation.
     *
     * @return SimpleCondition
     */
    public function setOperation($operation)
    {
        $this->operation = $operation;

        return $this;
    }

    /**
     * {@inheritdoc}
     */
    public static function fromArray(array $data)
    {
        $entity = parent::fromArray($data);

        if (array_key_exists('value', $data) &&
            array_key_exists('operation', $data) &&
            $entity instanceof SimpleCondition) {
            $entity->setOperation($data['operation']);
            $entity->setValue($data['value']);

            return $entity;
        }

        throw self::argumentException();
    }

    /**
     * {@inheritdoc}
     */
    public static function getType()
    {
        return 'simple';
    }
}
