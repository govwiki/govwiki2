<?php

namespace GovWiki\AdminBundle\Controller;

use GovWiki\DbBundle\Entity\Advertising;
use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;
use Symfony\Component\HttpFoundation\Request;
use GovWiki\AdminBundle\Form\AdvertisingForm;

/**
 * Class AdvertisingController
 * @package GovWiki\AdminBundle\Controller
 *
 * @Configuration\Route(
 *  "/{environment}/advertising",
 *  requirements={ "environment": "\w+" }
 * )
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
        if ($this->getCurrentEnvironment() === null) {
            return $this->redirectToRoute('govwiki_admin_main_home');
        }

        $em = $this->getDoctrine()->getManager();
        $environment = $this->getCurrentEnvironment();

        $advertising = $em->getRepository('GovWikiDbBundle:Advertising')
            ->findOneBy([ 'environment' => $environment->getId() ]);
        if (! $advertising instanceof Advertising) {
            $advertising = new Advertising();
        }

        $form = $this->createForm(new AdvertisingForm(), $advertising);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            if ($advertising->getId() === null) {
                $advertising->setEnvironment($environment);
            }
            $em->persist($advertising);
            $em->flush();
        }

        return [ 'form' => $form->createView() ];
    }
}
