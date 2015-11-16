<?php

namespace GovWiki\ApiBundle\Controller;

use GovWiki\DbBundle\Entity\Repository\GovernmentRepository;
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
     *  alt_type     - slugged alt type, default 'City'.
     *  limit        - max entities per request, default 25.
     *  page         - calculate offset based on this value, default 0.
     *  fields_order - assoc array of fields sorting order. Field name
     *                 (in camelCase) as key and sort order as value
     *                 ('desc' or 'asc').
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

        /*
         * Get max ranks fields name without id and alt type.
         */
        $maxRanksFields = [];
        foreach ($tmp as $fieldName) {
            if ('id' !== $fieldName && 'altType' !== $fieldName) {
                $maxRanksFields[] = str_replace('MaxRank', '', $fieldName);
            }
        }

        $altTypeSlug = $request->query->get('alt_type', 'City');

        /*
         * Remove some ranks based on current slugged alt type.
         */

        switch ($altTypeSlug) {
            case 'City':
                $maxRanksFields = array_filter($maxRanksFields, function($name) {
                    return ('frmpRate' !== $name) &&
                    ('academicPerformanceIndex' !== $name) &&
                    ('satScores' !== $name) &&
                    ('graduationRate' !== $name) &&
                    ('dropoutRate' !== $name) &&
                    ('expenditurePerStudent' !== $name) &&
                    ('enrollment ' !== $name);
                });
                break;
        }

        /** @var GovernmentRepository $repository */
        $repository = $this->getDoctrine()
            ->getRepository('GovWikiDbBundle:Government');

        return new JsonResponse(
            [
                'governments' => $repository
                    ->getGovernments(
                        $altTypeSlug,
                        $request->query->getInt('page', 0),
                        $request->query->getInt('limit', 25),
                        $request->query->get('fields_order', [])
                    ),
                'max_ranks' => $maxRanksFields,
                'count' => $repository->countGovernments($altTypeSlug),
            ]
        );
    }
}
