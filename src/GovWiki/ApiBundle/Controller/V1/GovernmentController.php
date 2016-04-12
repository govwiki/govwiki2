<?php

namespace GovWiki\ApiBundle\Controller\V1;

use GovWiki\ApiBundle\GovWikiApiServices;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * GovernmentController
 *
 * @Route("government")
 */
class GovernmentController extends AbstractGovWikiApiController
{

    const MAX_SALARIES_PER_PAGE = 25;
    const MAX_PENSIONS_PER_PAGE = 25;

    /**
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

        $governments = $this->getDoctrine()
            ->getRepository('GovWikiDbBundle:Government')
            ->search($this->getCurrentEnvironment()->getId(), $search);

        return new JsonResponse($governments);
    }

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
     *  year       - year of desired data.
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
        if ((null === $fieldName) || ('' === $fieldName)) {
            return new JsonResponse(
                [ 'message' => 'Provide field_name query parameter.' ],
                400
            );
        }

        /*
         * Check field name.
         */
        $fields = $this->getEnvironmentManager()->getRankedFields();
        $found = false;
        $tmp = preg_replace('|_rank$|', '', $fieldName);
        foreach ($fields as $field) {
            if ($field['field'] === $tmp) {
                $found = true;
                break;
            }
        }
        if (! $found) {
            return new JsonResponse([
                'message' => 'Unknown field name or maybe this field don\'t have rank.',
            ], 400);
        }

        $data = $this->getEnvironmentManager()->getGovernmentRank(
            $altTypeSlug,
            $slug,
            [
                'field_name' => $fieldName,
                'limit' => $request->query->getInt('limit', 25),
                'page' => $request->query->getInt('page', 0),
                'order' => $request->query->get('order', null),
                'name_order' => $request->query->get('name_order', null),
                'year' => $request->query->getInt('year'),
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

    /**
     * @Route("/{government}/salaries")
     * @Template()
     *
     * @param Request $request    A Request instance.
     * @param integer $government Government entity id.
     *
     * @return array
     */
    public function salariesAction(Request $request, $government)
    {
        $paginator = $this->get('knp_paginator');
        $year = $request->query->get(
            'year',
            $this->get(GovWikiApiServices::ENVIRONMENT_MANAGER)
                ->getAvailableYears()[0]
        );

        $salaries = $this->getDoctrine()
            ->getRepository('GovWikiDbBundle:Salary')
            ->getListQuery($government, $year);
        $salaries = $paginator->paginate(
            $salaries,
            $request->query->get('page', 1),
            self::MAX_SALARIES_PER_PAGE
        );

        return [ 'salaries' => $salaries ];
    }

    /**
     * @Route("/{government}/pensions")
     * @Template()
     *
     * @param Request $request    A Request instance.
     * @param integer $government Government entity id.
     *
     * @return array
     */
    public function pensionsAction(Request $request, $government)
    {
        $paginator = $this->get('knp_paginator');
        $year = $request->query->get(
            'year',
            $this->get(GovWikiApiServices::ENVIRONMENT_MANAGER)
                ->getAvailableYears()[0]
        );

        $pensions = $this->getDoctrine()
            ->getRepository('GovWikiDbBundle:Pension')
            ->getListQuery($government, $year);
        $pensions = $paginator->paginate(
            $pensions,
            $request->query->get('page', 1),
            self::MAX_PENSIONS_PER_PAGE
        );

        return [ 'pensions' => $pensions ];
    }
}
