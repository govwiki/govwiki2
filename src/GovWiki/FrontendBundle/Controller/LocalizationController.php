<?php

namespace GovWiki\FrontendBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;
use GovWiki\ApiBundle\GovWikiApiServices;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;

/**
 * Class LocalizationController
 * @package GovWiki\FrontendBundle\Controller
 *
 * @Configuration\Route("/localization")
 */
class LocalizationController extends Controller
{
    /**
     * Change locale
     *
     * @Configuration\Route("/change_locale/{locale_name}")
     *
     * @param string $locale_name Locale shortName.
     *
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function changeLocaleAction($locale_name)
    {
        $this->clearTranslationsCache();

        $this->get('session')->set('_locale', $locale_name);

        $environment_manager = $this->get(GovWikiApiServices::ENVIRONMENT_MANAGER);
        $environment = $environment_manager->getEnvironment();

        return $this->redirectToRoute('map', array('environment' => $environment));
    }

    /**
     * Show all environment locales in header
     *
     * @Configuration\Template()
     *
     * @return array
     */
    public function showLocalesInHeaderAction()
    {
        $environment_manager = $this->get(GovWikiApiServices::ENVIRONMENT_MANAGER);
        $environment = $environment_manager->getEnvironment();

        $locale_names_list = $this->getDoctrine()->getRepository('GovWikiDbBundle:AbstractLocale')->getListLocaleNames($environment);

        return [ 'locale_names_list' => $locale_names_list ];
    }

    private function clearTranslationsCache()
    {
        $cacheDir = __DIR__ . "/../../../../app/cache";
        $finder = new \Symfony\Component\Finder\Finder();
        $finder->in(array($cacheDir . "/" . $this->container->getParameter('kernel.environment') . "/translations"))->files();
        foreach($finder as $file){
            unlink($file->getRealpath());
        }
    }
}
