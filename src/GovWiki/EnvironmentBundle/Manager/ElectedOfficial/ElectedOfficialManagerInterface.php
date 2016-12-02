<?php

namespace GovWiki\EnvironmentBundle\Manager\ElectedOfficial;

use GovWiki\DbBundle\Entity\Environment;

/**
 * Interface ElectedOfficialManager
 * @package GovWiki\EnvironmentBundle\Manager\ElectedOfficial
 */
interface ElectedOfficialManagerInterface
{
    /**
     * Compute count of elected officials in given environment.
     *
     * @param Environment $environment A Environment entity instance.
     *
     * @return integer
     */
    public function computeElectedOfficialsCount(Environment $environment);

    /**
     * @param Environment $environment A Environment entity instance.
     * @param string      $partOfName  Part of elected official name.
     *
     * @return array
     */
    public function searchElectedOfficial(Environment $environment, $partOfName);

    /**
     * @param Environment|integer $environment A Environment entity instance or
     *                                         id.
     * @param string              $altTypeSlug Slugged government alt type.
     * @param string              $slug        Slugged government name.
     * @param string              $eoSlug      Slugged elected official full name.
     * @param integer             $user        User entity id.
     *
     * @return array|null
     */
    public function getElectedOfficial(
        $environment,
        $altTypeSlug,
        $slug,
        $eoSlug,
        $user = null
    );
}
