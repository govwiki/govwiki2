<?php

namespace GovWiki\FrontendBundle\Service;

/**
 * Class GetAdverting
 * @package GovWiki\FrontendBundle\Service
 */
class GetAdverting
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
     * @param string $advertingName
     * @return null
     */
    public function getAdverting($advertingName)
    {
        /* @var \GovWiki\DbBundle\Entity\Adverting $adverting */

        $adverting = $this->doctrine->getManager()->getRepository('GovWikiDbBundle:Adverting')
            ->findOneByAdvertingType($advertingName);

        if ($adverting && $adverting->getAdvertingEnable()) {
            return $this->templating->render(
                'GovWikiFrontendBundle:Adverting:default.html.twig',
                [
                    'code' => $adverting->getAdvertingCode(),
                ]
            );
        }

        return null;
    }
}
