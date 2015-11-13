<?php

namespace GovWiki\ApiBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class RankOrderController
 * @package GovWiki\ApiBundle\Controller
 */
class RankOrderController extends Controller
{
    /**
     * @Route(path="/", methods={"GET"})
     *
     * Query parameters:
     *  alt type     - slugged alt type, default 'City'.
     *  limit        - max entities per request, default 25.
     *  page         - calculate offset based on this value, default 0.
     *  fields_order - assoc array of fields sorting order. Field name (camelCase) as key and sort order as value ('desc' or 'asc').
     *
     * @param Request $request A Request instance.
     *
     * @return JsonResponse
     */
    public function listAction(Request $request)
    {
        $tmp = $this->getDoctrine()->getManager()
            ->getClassMetadata('GovWikiDbBundle:MaxRank')
            ->getFieldNames();

        $maxRanksFields = [];
        foreach ($tmp as $fieldName) {
            if ('id' !== $fieldName && 'altType' !== $fieldName) {
                $maxRanksFields[] = str_replace('MaxRank', '', $fieldName);
            }
        }

        return new JsonResponse(
            [
                'governments' => $this->getDoctrine()
                    ->getRepository('GovWikiDbBundle:Government')
                    ->getGovernments(
                        $request->query->get('alt_type', 'City'),
                        $request->query->getInt('page', 0),
                        $request->query->getInt('limit', 25),
                        $request->query->get('fields_order', [])
                    ),
                'max_ranks' => $maxRanksFields,
            ]
        );
    }
}
