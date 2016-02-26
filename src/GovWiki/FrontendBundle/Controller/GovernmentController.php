<?php

namespace GovWiki\FrontendBundle\Controller;

use GovWiki\ApiBundle\GovWikiApiServices;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

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
        // get compared data
        if ($request->request->get('comparedData')) {
            return new JsonResponse(
                $this->get(GovWikiApiServices::ENVIRONMENT_MANAGER)
                    ->getComparedGovernments($request->request->get('comparedData'))
            );
        }

        // get request for get category
        if ($request->request->get('governmentsId')) {
            return new JsonResponse(
                $this->get(GovWikiApiServices::ENVIRONMENT_MANAGER)
                ->getCategoriesRevenuesAndExpendituresByGoverment($request->request->get('governmentsId'))
            );
        }

        // get request years for government
        if ($request->request->get('yearByGovId')) {
            return new JsonResponse(
                $this->get(GovWikiApiServices::ENVIRONMENT_MANAGER)
                ->getYearsByGovernment($request->request->get('yearByGovId'))
            );
        }

        return $this->get(GovWikiApiServices::ENVIRONMENT_MANAGER)
            ->getGovernment(
                $altTypeSlug,
                $slug,
                $request->query->get('year', null)
            );
    }
}
