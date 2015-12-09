<?php

namespace GovWiki\ApiBundle\Manager;

use Doctrine\ORM\EntityManagerInterface;

/**
 * Class EnvironmentManager
 * @package GovWiki\ApiBundle\Manager
 */
class EnvironmentManager
{
    /**
     * @var EntityManagerInterface
     */
    private $em;

    /**
     * @var string
     */
    private $environment;

    /**
     * @param EntityManagerInterface $em A EntityManagerInterface instance.
     */
    public function __construct(EntityManagerInterface $em)
    {
        $this->em = $em;
    }

    /**
     * @param string $environment Environment name, same as map name.
     *
     * @return EnvironmentManager
     */
    public function setEnvironment($environment)
    {
        $this->environment = $environment;

        return $this;
    }

    /**
     * @return string
     */
    public function getEnvironment()
    {
        return $this->environment;
    }

    /**
     * @return array|null
     */
    public function getMap()
    {
        return $this->em->getRepository('GovWikiDbBundle:Map')
            ->getWithGovernments($this->environment);
    }
}
