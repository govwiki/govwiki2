<?php

namespace GovWiki\EnvironmentBundle\Manager\Rank;

use GovWiki\DbBundle\Entity\Environment;

/**
 * Interface RankManagerInterface
 * @package GovWiki\EnvironmentBundle\Manager\Rank
 */
interface RankManagerInterface
{

    /**
     * Compute and persist to database new ranks values.
     *
     * @param Environment $environment A Environment entity instance.
     *
     * @return void
     *
     * @throws \Doctrine\DBAL\DBALException SQL error while update max ranks.
     */
    public function compute(Environment $environment);
}
