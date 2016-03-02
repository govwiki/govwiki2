<?php

namespace GovWiki\FrontendBundle\Controller;

use GovWiki\ApiBundle\GovWikiApiServices;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;

/**
 * MainController
 */
class GovernmentController extends Controller
{
    /**
     * @Route("/{altTypeSlug}/{slug}", name="government")
     * @Template("GovWikiFrontendBundle:Government:index.html.twig")
     *
     * @param Request $request     A Request instance.
     * @param string  $altTypeSlug Slugged government alt type.
     * @param string  $slug        Slugged government name.
     *
     * @return array
     */
    public function governmentAction(Request $request, $altTypeSlug, $slug)
    {
        $this->clearTranslationsCache();

        return $this->get(GovWikiApiServices::ENVIRONMENT_MANAGER)
            ->getGovernment(
                $altTypeSlug,
                $slug,
                $request->query->get('year', null)
            );
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
