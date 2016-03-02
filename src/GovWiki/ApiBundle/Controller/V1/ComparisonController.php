<?php

namespace GovWiki\ApiBundle\Controller\V1;

use Doctrine\Common\Annotations\Annotation\Required;
use GovWiki\ApiBundle\GovWikiApiServices;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

/**
 * ComparisonController
 *
 * @Route("comparison")
 */
class ComparisonController extends AbstractGovWikiApiController
{

    /**
     * Require 'search' parameter in query string.
     * Return array of appropriate governments as array of its id, name and
     * array of available years.
     *
     * @Route("/search")
     *
     * @param Request $request A Request instance.
     *
     * @return \Symfony\Component\HttpFoundation\JsonResponse
     */
    public function searchAction(Request $request)
    {
        $search = $request->query->get('search', null);
        if (null === $search) {
            return $this->badRequestResponse(
                'Provide required query parameter \'search\''
            );
        }

        return new JsonResponse($this->environmentManager()
            ->searchGovernmentForComparison($search));
    }

    /**
     *
     * @Route("/captions", methods={"POST"})
     *
     * Get available findata captions for comparison between given governments
     * by years.
     *
     * Require 'application/json' Content-Type. Request must contains object
     * with one field 'captions' which is array of objects, each of which
     * contains two required field: 'id', and 'year'.
     *
     * Example:
     * {
     *  "captions": [
     *      {
     *          "id": 4104,
     *          "year": 2014
     *      },
     *      {
     *          "id": 4087,
     *          "year": 2014
     *      },
     *  ]
     * }
     *
     * @param Request $request A Request instance.
     *
     * @return \Symfony\Component\HttpFoundation\JsonResponse
     */
    public function captionsAction(Request $request)
    {
        if ('json' !== $request->getContentType()) {
            return new JsonResponse(
                [ 'message' => 'Require application/json content type' ],
                400
            );
        }

        $data = json_decode($request->getContent(), true);
        $captions = $this->get(GovWikiApiServices::ENVIRONMENT_MANAGER)
            ->getCategoriesRevenuesAndExpendituresByGovernment($data['captions']);

        return new JsonResponse($captions);
    }

    /**
     *
     * @Route("/compare", methods={"POST"})
     *
     * Compare given governments.
     *
     * Require 'application/json' Content-Type. Request must contains object
     * with four fields: 'firstGovernment', 'secondGovernment', 'caption'
     * and 'category'. Government fileds is object with two required field:
     * 'id' and 'year'. Category id 'category' field from caption object.
     *
     * Optional: caption field is 'name' field of one of the returned
     * objects by {@see ComparisonController::captionsAction} for specified
     * governments.
     *
     * Example:
     * {
     *  "firstGovernment": {
     *      "id": 4104,
     *      "year": 2014
     *  },
     *  "secondGovernment": {
     *      "id": 4087,
     *      "year": 2014
     *  },
     *  "caption": "Capital Outlay", [optional]
     *  "category": "Expenditures"
     * }
     *
     * @param Request $request A Request instance.
     *
     * @return \Symfony\Component\HttpFoundation\JsonResponse
     */
    public function compareAction(Request $request)
    {
        if ('json' !== $request->getContentType()) {
            return new JsonResponse(
                [ 'message' => 'Require application/json content type' ],
                400
            );
        }

        $data = json_decode($request->getContent(), true);
        $result = $this->get(GovWikiApiServices::ENVIRONMENT_MANAGER)
            ->getComparedGovernments($data);

        return new JsonResponse($result);
    }
}
