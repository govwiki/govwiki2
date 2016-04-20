<?php

namespace GovWiki\DbBundle\Doctrine\Type\ColoringConditions;

/**
 * Class AbstractCondition
 * @package GovWiki\DbBundle\Doctrine\Type\ColoringConditions
 */
abstract class AbstractCondition implements ConditionInterface
{

    /**
     * @var string
     */
    private $color;

    /**
     * @param string $color Color.
     */
    public function __construct($color)
    {
        $this->color = $color;
    }

    /**
     * {@inheritdoc}
     */
    public function toArray()
    {
        return [
            'type' => static::getType(),
            'color' => $this->color,
        ];
    }

    /**
     * @return string
     */
    public function getColor()
    {
        return $this->color;
    }

    /**
     * @param string $color Color.
     *
     * @return AbstractCondition
     */
    public function setColor($color)
    {
        $this->color = $color;

        return $this;
    }

    /**
     * {@inheritdoc}
     */
    public static function fromArray(array $data)
    {
        if (array_key_exists('type', $data) &&
            array_key_exists('color', $data)) {
            $entity = self::newInstance();
            $entity->setColor($data['color']);

            return $entity;
        }

        throw self::argumentException();
    }

    /**
     * @return \InvalidArgumentException
     */
    protected static function argumentException()
    {
        return new \InvalidArgumentException(
            "Invalid array data for '".static::getType()."' condition"
        );
    }

    /**
     * @return AbstractCondition
     */
    private static function newInstance()
    {
        if (PHP_VERSION_ID === 50429 || PHP_VERSION_ID === 50513 || PHP_VERSION_ID >= 50600) {
            $reflection = new \ReflectionClass(static::class);

            return $reflection->newInstanceWithoutConstructor();
        } else {
            return unserialize(sprintf('O:%d:"%s":0:{}', strlen(static::class), static::class));
        }
    }
}
