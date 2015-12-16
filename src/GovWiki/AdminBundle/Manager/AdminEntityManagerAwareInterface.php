<?php

namespace GovWiki\AdminBundle\Manager;

/**
 * Interface AdminEntityManagerAwareInterface
 * @package GovWiki\AdminBundle\Manager
 */
interface AdminEntityManagerAwareInterface
{
    /**
     * @param string $environment Environment name.
     *
     * @return void
     */
    public function setEnvironment($environment);

    /**
     * @param integer $id Environment id.
     *
     * @return void
     */
    public function setEnvironmentId($id);
}
