<?php

namespace GovWiki\EnvironmentBundle\Manager\Data\Format;

/**
 * Interface FormatManagerInterface
 * @package GovWiki\EnvironmentBundle\Data\Manager\Data\Government
 */
interface FormatManagerInterface
{

    /**
     * Get format information for given field in specified environment.
     *
     * @param string $environment Environment entity slug.
     * @param string $fieldName   Field name.
     *
     * @return array|null
     */
    public function getFieldFormat($environment, $fieldName);

    /**
     * @param string      $environment Environment entity slug.
     * @param string|null $altType     If set get only formats show only in
     *                                 specified government alt type.
     *
     * @return mixed
     */
    public function getList($environment, $altType = null);
}
