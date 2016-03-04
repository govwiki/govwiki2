<?php

namespace GovWiki\FrontendBundle\Service;

/**
 * Class GetAdvertising
 * @package GovWiki\FrontendBundle\Service
 */
class GetAdvertising
{
    /**
     * @var object
     */
    private $doctrine;

    /**
     * @var object
     */
    private $templating;

    /**
     * @param object $doctrine
     * @param object $templating
     */
    public function __construct($doctrine, $templating)
    {
        $this->doctrine   = $doctrine;
        $this->templating = $templating;
    }

    /**
     * Get adverting code
     *
     * @param string $environment
     * @param string $advertingName
     * @return null
     */
    public function getAdvertising($environment, $advertingName)
    {
        /* @var \GovWiki\DbBundle\Entity\Advertising $adverting */

        $currentEnvironment = $this->doctrine->getManager()
            ->getRepository("GovWikiDbBundle:Environment")->findOneBySlug($environment);

        $adverting = $this->doctrine->getManager()
            ->createQuery(
                'SELECT ad
                FROM GovWikiDbBundle:Advertising ad
                WHERE ad.advertingType = :advertingType
                AND ad.environment = :environment'
            )
            ->setParameters(
                [
                    'advertingType' => $advertingName,
                    'environment'   => $currentEnvironment->getId(),
                ]
            )
            ->getSingleResult();

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
