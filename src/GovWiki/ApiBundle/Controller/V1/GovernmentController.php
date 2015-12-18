<?php

namespace GovWiki\ApiBundle\Controller\V1;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;

/**
 * GovernmentController
 *
 * @Route("government")
 */
class GovernmentController extends AbstractGovWikiApiController
{
    /**
     * @Route("/{altTypeSlug}/{slug}", methods="GET")
     *
     * @param  string $altTypeSlug Government alt type.
     * @param  string $slug        Government slugged name.
     *
     * @return Response
     */
    public function showAction($altTypeSlug, $slug)
    {
        return $this->serializedResponse(
            $this->environmentManager()->getGovernment($altTypeSlug, $slug),
            [ 'government' ]
        );

    }

//    /**
//     * @Route("/get-markers-data", methods="GET")
//     *
//     * Get markers data
//     *
//     * @param  Request $request A Request instance.
//     *
//     * @return JsonResponse
//     */
//    public function getMarkersDataAction(Request $request)
//    {
//        $em = $this->getDoctrine()->getManager();
//
//        if ($limit = $request->query->get('limit')) {
//            $data = $em->getRepository('GovWikiDbBundle:Government')->getMarkers($request->query->get('altTypes'), $limit);
//        } else {
//            $data = $em->getRepository('GovWikiDbBundle:Government')->getMarkers($request->query->get('altTypes'));
//        }
//
//        return new JsonResponse($data);
//    }

    /**
     * @Route("/{altTypeSlug}/{slug}/get_ranks", methods={"GET"})
     *
     * Query parameters:
     *  field_name - field name in camelCase.
     *  limit      - max entities per request, default 25.
     *  page       - calculate offset based on this value, default null.
     *  order      - sorting order by given field_name, 'desc' or 'asc',
     *               default null.
     *  name_order - sorting order by government name, 'desc' or 'asc',
     *               default null.
     *
     * @param Request $request     A Request instance.
     * @param string  $altTypeSlug Alt type slug.
     * @param string  $slug        Government slug.
     *
     * @return JsonResponse
     */
    public function getRanksAction(Request $request, $altTypeSlug, $slug)
    {
        $fieldName = $request->query->get('field_name', null);
        if (empty($fieldName)) {
            return new JsonResponse([ 'message' => 'Provide field_name query parameter.' ], 400);
        }

        /*
         * Check field name.
         */
        $fields = $this->getDoctrine()->getManager()->getClassMetadata('GovWikiDbBundle:Government')
            ->getFieldNames();
        $found = false;
        foreach ($fields as $field) {
            if ($field === $fieldName) {
                $found = true;
                break;
            }
        }
        if (! $found) {
            return new JsonResponse([
                'message' => 'Unknown field name, provide in camel case like in Government entity.',
            ], 400);
        }

        $data = $this->environmentManager()->getGovernmentRank(
            $altTypeSlug,
            $slug,
            [
                'field_name' => $fieldName,
                'limit' => $request->query->getInt('limit', 25),
                'page' => $request->query->getInt('page', 0),
                'order' => $request->query->get('order', null),
                'name_order' => $request->query->get('name_order', null),
            ]
        );

        /*
         * Canonize field name and value.
         */
        foreach ($data as &$row) {
            $row['name'] = str_replace('_', ' ', $row['name']);
        }

        return new JsonResponse([
            'data' => $data,
            'alt_type' => str_replace('_', ' ', $altTypeSlug),
        ]);
    }
}
