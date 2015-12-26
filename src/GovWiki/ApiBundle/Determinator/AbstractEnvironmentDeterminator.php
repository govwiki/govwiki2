<?php

namespace GovWiki\ApiBundle\Determinator;

/**
 * Interface AbstractEnvironmentDeterminator
 * @package GovWiki\ApiBundle\Determinator
 */
abstract class AbstractEnvironmentDeterminator
{
    protected $slug;

    /**
     * @return mixed
     */
    public function getSlug()
    {
        return $this->slug;
    }
}
