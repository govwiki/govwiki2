<?php

namespace GovWiki\ApiBundle\Determinator;

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Routing\RouterInterface;

/**
 * Class HostDeterminator
 * @package GovWiki\ApiBundle\Determinator
 */
class HostDeterminator extends AbstractEnvironmentDeterminator
{
    /**
     * @param EntityManagerInterface $em     A EntityManagerInterface instance.
     * @param RouterInterface        $router A RouterInterface instance.
     */
    public function __construct(
        EntityManagerInterface $em,
        RouterInterface $router
    ) {
        $host = $router->getContext()->getHost();

        $this->slug = $em->getRepository('GovWikiDbBundle:Environment')
            ->getNameByDomain($host);
    }
}
