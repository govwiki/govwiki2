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
     * @var string
     */
    protected $environment;

    /**
     * @param string $environment Symfony environment.
     */
    public function __construct($environment)
    {
        $this->environment = $environment;
    }

    /**
     * @param Request $request A Request instance.
     *
     * @return string
     */
    abstract public function getSlug(Request $request);
}
