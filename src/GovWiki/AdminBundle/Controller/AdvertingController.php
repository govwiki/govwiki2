<?php

namespace GovWiki\AdminBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use GovWiki\AdminBundle\Form\AdvertingForm;

/**
 * Class AdvertingController
 * @package GovWiki\AdminBundle\Controller
 *
 * @Configuration\Route("/adverting")
 */
class AdvertingController extends Controller
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
        $defaultEntity = $em->getRepository('GovWikiDbBundle:Adverting')
            ->findOneByAdvertingType('google_adsense');

        $form = $this->createForm(new AdvertingForm(), $defaultEntity);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $em->flush();
        }

        return [
            'form' => $form->createView(),
        ];
    }
}
