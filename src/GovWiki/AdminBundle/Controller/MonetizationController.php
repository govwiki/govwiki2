<?php

namespace GovWiki\AdminBundle\Controller;

use GovWiki\AdminBundle\Form\MonetizationForm;
use GovWiki\DbBundle\Entity\Monetization;
use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class AdvertisingDonationController
 * @package GovWiki\AdminBundle\Controller
 *
 * @Configuration\Route(
 *  "/{environment}/monetization",
 *  requirements={ "environment": "\w+" }
 * )
 */
class MonetizationController extends AbstractGovWikiAdminController
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

        $monetizations = $em->getRepository('GovWikiDbBundle:Monetization')
            ->findBy([ 'environment' => $environment->getId() ]);

        // Get advertising and donation.
        $advertising = $this->getAdvertisings($monetizations);
        $button = $this->getDonationButtons($monetizations);

        $form = $this->createFormBuilder([
            'advertising' => $advertising,
            'button' => $button,
        ])
            ->add('advertising', new MonetizationForm())
            ->add('button', new MonetizationForm())
            ->getForm();

        $form->handleRequest($request);
        if ($form->isValid()) {
            $em->persist($advertising);
            $em->persist($button);
            $em->flush();
        }

        return [ 'form' => $form->createView() ];
    }

    /**
     * @param array $monetizations Array of Monetization entities.
     *
     * @return Monetization
     */
    private function getAdvertisings(array $monetizations)
    {
        $advertisings = array_filter(
            $monetizations,
            function (Monetization $monetization) {
                return $monetization->isAdvertising();
            }
        );

        if (count($advertisings) > 0) {
            return current($advertisings);
        }

        return Monetization::createAdvertising($this->getCurrentEnvironment());
    }

    /**
     * @param array $monetizations Array of Monetization entities.
     *
     * @return Monetization
     */
    private function getDonationButtons(array $monetizations)
    {
        $buttons = array_filter(
            $monetizations,
            function (Monetization $monetization) {
                return $monetization->isDonationButton();
            }
        );

        if (count($buttons) > 0) {
            return current($buttons);
        }

        return Monetization::createDonationButton($this->getCurrentEnvironment());
    }
}
