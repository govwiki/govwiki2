<?php

namespace GovWiki\AdminBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use GovWiki\AdminBundle\Form\AdvertisingForm;
use GovWiki\AdminBundle\GovWikiAdminServices;

/**
 * Class AdvertisingController
 * @package GovWiki\AdminBundle\Controller
 *
 * @Configuration\Route("/advertising")
 */
class AdvertisingController extends AbstractGovWikiAdminController
{
    /**
     * Adverting index page
     *
     * @Configuration\Route("/")
     * @Configuration\Template
     * @Configuration\Security("is_granted('ROLE_ADMIN')")
     *
     * @param Request $request A Request instance.
     *
     * @return array
     */
    public function indexAction(Request $request)
    {
        $em = $this->getDoctrine()->getManager();
        $environmentSlug = $this->getCurrentEnvironment()->getSlug();
        $currentEnvironment = $em->getRepository("GovWikiDbBundle:Environment")->findOneBySlug($environmentSlug);

        $defaultEntity = $em
            ->createQuery(
                'SELECT ad
                FROM GovWikiDbBundle:Advertising ad
                WHERE ad.advertingType = :advertingType
                AND ad.environment = :environment'
            )
            ->setParameters(
                [
                    'advertingType' => 'google_adsense',
                    'environment'   => $currentEnvironment->getId(),
                ]
            )
            ->getSingleResult();

        $form = $this->createForm(new AdvertisingForm($currentEnvironment), $defaultEntity);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $em->flush();
        }

        return [
            'form' => $form->createView(),
        ];
    }
}
