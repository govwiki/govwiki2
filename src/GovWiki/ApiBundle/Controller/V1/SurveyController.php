<?php

namespace GovWiki\ApiBundle\Controller\V1;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

/**
 * SurveyController
 *
 * @Route("survey")
 */
class SurveyController extends AbstractGovWikiApiController
{

    /**
     * @Route("/hook")
     *
     * @param Request $request A Request instance.
     *
     * @return \Symfony\Component\HttpFoundation\JsonResponse
     */
    public function hookAction(Request $request)
    {
        return new JsonResponse();
    }
}
