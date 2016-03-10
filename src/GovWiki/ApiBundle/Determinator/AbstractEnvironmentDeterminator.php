<?php

namespace GovWiki\ApiBundle\Determinator;

use Symfony\Component\HttpFoundation\Request;

/**
 * Interface AbstractEnvironmentDeterminator
 * @package GovWiki\ApiBundle\Determinator
 */
abstract class AbstractEnvironmentDeterminator
{

    /**
     * @param Request $request A Request instance.
     *
     * @return string
     */
    abstract public function getSlug(Request $request);
}
