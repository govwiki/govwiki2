<?php

namespace GovWiki\AdminBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class LocalizationController
 * @package GovWiki\AdminBundle\Controller
 *
 * @Configuration\Route("/localization")
 */
class LocalizationController extends Controller
{
    /**
     * Show list of languages.
     *
     * @Configuration\Route("/", methods="GET")
     * @Configuration\Template()
     *
     * @return array
     *
     * @throws \LogicException Some required bundle not registered.
     */
    public function indexAction(Request $request)
    {
        //$em = $this->getDoctrine()->getManager();
        $translationManager = $this->container->get('asm_translation_loader.translation_manager');
        $l10n_list = $translationManager->findTranslationsByLocaleAndDomain('en');

        $l10n_pagination = $this->paginate(
            $l10n_list,
            $request->query->getInt('page', 1),
            20
        );

        return [ 'l10n_list' => $l10n_pagination ];
    }
}
