<?php

namespace GovWiki\GeneratorBundle\Util;

/**
 * Class PidPool
 * @package GovWiki\GeneratorBundle\Util
 */
class PidPool
{

    /**
     * Path to pid file.
     *
     * @var string
     */
    private $filePath;

    /**
     * @var integer[]
     */
    private $pool;

    /**
     * @param string $filePath Path to pid file.
     */
    public function __construct($filePath)
    {
        $this->filePath = $filePath;
        $this->pool = [];
    }

    /**
     * Add new pid into pool.
     *
     * @param integer $pid Process id.
     *
     * @return $this
     */
    public function add($pid)
    {
        $this->pool[] = (int) $pid;

        return $this;
    }

    /**
     * Store pool into file.
     *
     * @return $this
     */
    public function store()
    {
        file_put_contents($this->filePath, serialize($this->pool));

        return $this;
    }

    /**
     * Get all pids from file.
     *
     * @return $this
     */
    public function restore()
    {
        $this->pool = [];
        if (file_exists($this->filePath)) {
            $this->pool = unserialize(file_get_contents($this->filePath));
        }

        return $this;
    }

    /**
     * @param integer $signo One of PCNTL signals constants.
     *
     * @return $this
     */
    public function sendSignal($signo)
    {
        foreach ($this->pool as $pid) {
            posix_kill($pid, $signo);
        }

        return $this;
    }

    /**
     * Clear current pool and remove pid file.
     *
     * @return $this
     */
    public function clear()
    {
        $this->pool = [];
        if (file_exists($this->filePath)) {
            unlink($this->filePath);
        }

        return $this;
    }
}
