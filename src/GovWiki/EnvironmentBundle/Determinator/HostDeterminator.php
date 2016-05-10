<?php

namespace GovWiki\EnvironmentBundle\Determinator;

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class HostDeterminator
 * @package GovWiki\EnvironmentBundle\Determinator
 */
class HostDeterminator implements EnvironmentDeterminatorInterface
{

    /**
     * @var EntityManagerInterface
     */
    private $em;

    /**
     * @param EntityManagerInterface $em A EntityManagerInterface instance.
     */
    public function __construct(EntityManagerInterface $em)
    {
        $this->em = $em;
    }

    /**
     * Try to determine environment by request.
     *
     * @param Request $request A Request instance.
     *
     * @return string
     */
    public function determine(Request $request)
    {
        $host = $request->getHost();

        if (strpos($host, 'm.') === 0) {
            // In mobile environment, remove 'm.' prefix from the host.
            $host = substr($host, 2);
        }

        return $this->em->getRepository('GovWikiDbBundle:Environment')
            ->getByDomain($host);
    }
}
