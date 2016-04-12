<?php

namespace GovWiki\EnvironmentBundle\Manager\Data;

use Doctrine\ORM\EntityManagerInterface;
use GovWiki\EnvironmentBundle\Converter\DataType\DataTypeConverter;
use GovWiki\EnvironmentBundle\Converter\DataType\DataTypeConverterInterface;

/**
 * Abstract data manager service, use as parent by concrete data managers.
 *
 * @package GovWiki\EnvironmentBundle\DataManager
 */
abstract class AbstractDataManager
{

    /**
     * @var DataTypeConverterInterface
     */
    private $dataTypeConverter;

    /**
     * @var EntityManagerInterface
     */
    protected $em;

    /**
     * @param EntityManagerInterface $em A EntityManagerInterface instance.
     */
    public function __construct(EntityManagerInterface $em)
    {
        $this->em = $em;
    }

    /**
     * @return DataTypeConverterInterface
     */
    public function getDataTypeConverter()
    {
        if (null === $this->dataTypeConverter) {
            $this->dataTypeConverter = new DataTypeConverter();
        }

        return $this->dataTypeConverter;
    }
}
