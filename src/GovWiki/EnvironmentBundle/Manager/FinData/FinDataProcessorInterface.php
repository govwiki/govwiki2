<?php

namespace GovWiki\EnvironmentBundle\Manager\FinData;

/**
 * Interface FinDataProcessorInterface
 * @package GovWiki\EnvironmentBundle\Manager\FinData
 */
interface FinDataProcessorInterface
{

    /**
     * @param array $finData Fin data rows fetched by government manager.
     *
     * @return array
     */
    public function process(array $finData);
}
