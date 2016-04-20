<?php

namespace GovWiki\FrontendBundle\Service;

use Doctrine\ORM\EntityManagerInterface;
use GovWiki\DbBundle\Entity\Environment;
use Symfony\Bundle\FrameworkBundle\Templating\EngineInterface;

/**
 * Class GetAdvertising
 * @package GovWiki\FrontendBundle\Service
 */
class GetAdvertising
{
    /**
     * @var EntityManagerInterface
     */
    private $em;

    /**
     * @var EngineInterface
     */
    private $templating;

    /**
     * @param EntityManagerInterface $em         A EntityManagerInterface
     *                                           instance.
     * @param EngineInterface        $templating A EngineInterface instance.
     */
    public function __construct(
        EntityManagerInterface $em,
        EngineInterface $templating
    ) {
        $this->em   = $em;
        $this->templating = $templating;
    }

    /**
     * Get adverting code.
     *
     * @param Environment $environment   A Environment entity instance.
     * @param string      $advertingName Adverting name.
     *
     * @return null
     */
    public function getAdvertising(Environment $environment, $advertingName)
    {
        $adverting = $this->em
            ->createQuery(
                'SELECT ad
                FROM GovWikiDbBundle:Advertising ad
                WHERE ad.advertingType = :advertingType
                AND ad.environment = :environment'
            )
            ->setParameters(
                [
                    'advertingType' => $advertingName,
                    'environment'   => $environment->getId(),
                ]
            )
            ->getOneOrNullResult();

        if ($adverting && $adverting->getAdvertingEnable()) {
            return $this->templating->render(
                'GovWikiFrontendBundle:Advertising:default.html.twig',
                [
                    'code' => $adverting->getAdvertingCode(),
                ]
            );
        }

        return null;
    }
}
