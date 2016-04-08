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
     * @param string                 $environment Symfony environment.
     * @param EntityManagerInterface $em          A EntityManagerInterface
     *                                            instance.
     */
    public function __construct($environment, EntityManagerInterface $em)
    {
        parent::__construct($environment);
        $this->em = $em;
    }

    /**
     * {@inheritdoc}
     */
    public function getSlug(Request $request)
    {
        $host = $request->getHost();

        if (($this->environment === 'mobile') &&
            (strpos($host, 'm.') !== false)) {
            $host = substr($host, 2);
        }

        $slug = $this->em->getRepository('GovWikiDbBundle:Environment')
            ->getNameByDomain($host);
        if (null === $slug) {
            $slug = '';
        }

        return $slug;
    }
}
