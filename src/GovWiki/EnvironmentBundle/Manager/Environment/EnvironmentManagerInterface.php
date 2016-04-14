<?php

namespace GovWiki\EnvironmentBundle\Manager\Environment;

use GovWiki\DbBundle\Entity\Environment;
use GovWiki\EnvironmentBundle\Strategy\NamingStrategyInterface;

/**
 * Interface EnvironmentManagerInterface
 * @package GovWiki\EnvironmentBundle\Manager
 */
interface EnvironmentManagerInterface
{

    /**
     * Get current environment.
     *
     * @return Environment
     */
    public function getEnvironment();

    /**
     * Get format information for given field.
     *
     * @param string $fieldName Field name.
     *
     * @return array|null
     */
    public function getFieldFormat($fieldName);

    /**
     * Return available years for current environment.
     *
     * @return integer[]
     */
    public function getAvailableYears();

    /**
     * @return integer
     */
    public function computeElectedOfficialsCount();
}
