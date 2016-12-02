<?php

namespace GovWiki\GeneratorBundle\Service;

use GovWiki\GeneratorBundle\Util\PidPool;

/**
 * Class PidPoolFactory
 * @package GovWiki\GeneratorBundle\Service
 */
class PidPoolFactory
{

    /**
     * @var string
     */
    private $basePath;

    /**
     * @param string $basePath The path to the directory where pid files will be
     *                         stored.
     */
    public function __construct($basePath)
    {
        $this->basePath = rtrim($basePath, DIRECTORY_SEPARATOR);
    }

    /**
     * @param string $name Pool name.
     *
     * @return PidPool
     */
    public function create($name)
    {
        return new PidPool($this->basePath . DIRECTORY_SEPARATOR . $name);
    }
}
