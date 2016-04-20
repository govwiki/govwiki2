<?php

namespace GovWiki\EnvironmentBundle\Determinator;

use GovWiki\DbBundle\Entity\Environment;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class EnvironmentDeterminatorInterface
 * @package GovWiki\EnvironmentBundle\Determinator
 */
interface EnvironmentDeterminatorInterface
{
    /**
     * Try to determine environment by request.
     *
     * @param Request $request A Request instance.
     *
     * @return Environment
     */
    public function determine(Request $request);
}
