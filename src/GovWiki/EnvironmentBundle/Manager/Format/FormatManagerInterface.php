<?php

namespace GovWiki\EnvironmentBundle\Manager\Format;

use GovWiki\DbBundle\Entity\Environment;

/**
 * Interface FormatManagerInterface
 * @package GovWiki\EnvironmentBundle\Manager\Format
 */
interface FormatManagerInterface
{

    /**
     * @param Environment $environment Environment entity id.
     * @param boolean     $plain       Flag, if set return plain array without
     *                                 grouping by tab names and fields.
     *
     * @return array
     */
    public function get(Environment $environment, $plain = false);

    /**
     * Get format information for given field.
     *
     * @param Environment $environment A Environment entity instance.
     * @param string      $fieldName   Field name.
     *
     * @return array|null
     */
    public function getFieldFormat(Environment $environment, $fieldName);

    /**
     * @param Environment $environment A Environment entity instance.
     *
     * @return array
     */
    public function getRankedFields(Environment $environment);

    /**
     * @param Environment $environment A Environment entity instance.
     * @param string|null $altType     If set get only formats show only in
     *                                 specified government alt type.
     *
     * @return array
     */
    public function getList(Environment $environment, $altType = null);
}
