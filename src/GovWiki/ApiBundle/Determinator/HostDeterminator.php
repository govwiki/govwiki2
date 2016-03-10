<?php

namespace GovWiki\ApiBundle\Determinator;

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class HostDeterminator
 * @package GovWiki\ApiBundle\Determinator
 */
class HostDeterminator extends AbstractEnvironmentDeterminator
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
     * {@inheritdoc}
     */
    public function getSlug(Request $request)
    {
        $host = $request->getHost();

        $slug = $this->em->getRepository('GovWikiDbBundle:Environment')
            ->getNameByDomain($host);
        if (null === $slug) {
            $slug = '';
        }

        return $slug;
    }
}
