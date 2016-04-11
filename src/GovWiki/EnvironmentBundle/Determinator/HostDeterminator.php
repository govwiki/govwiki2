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

        return $this->em->getRepository('GovWikiDbBundle:Environment')
            ->getByDomain($host);
    }
}
