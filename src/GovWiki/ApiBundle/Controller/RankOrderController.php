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
        $altTypeSlug = $request->query->get('alt_type', null);
        /** @var GovernmentRepository $repository */
        $repository = $this->getDoctrine()
            ->getRepository('GovWikiDbBundle:Government');

        if (null === $altTypeSlug) {
            $data = [];
            $altTypes = [
                'city' => 'City',
                'county' => 'County',
                'school_district' => 'School_District',
                'special_district' => 'Special_District',
            ];

            foreach ($altTypes as $name => $slug) {
                $data[$name] = [
                    'governments' => $repository
                        ->getGovernments(
                            $slug,
                            $request->query->getInt('page', 0),
                            $request->query->getInt('limit', 10),
                            $request->query->get('fields_order', [])
                        ),
                    'max_ranks'   => $this->getMaxRanksFields($slug),
                    'count'       => $repository->countGovernments($slug),
                ];
            }
            return new JsonResponse($data);
        } else {
            return new JsonResponse(
                [
                    'governments' => $repository
                        ->getGovernments(
                            $altTypeSlug,
                            $request->query->getInt('page', 0),
                            $request->query->getInt('limit', 10),
                            $request->query->get('fields_order', [])
                        ),
                    'max_ranks'   => $this->getMaxRanksFields($altTypeSlug),
                    'count'       => $repository->countGovernments($altTypeSlug),
                ]
            );
        }
    }

    /**
     * Get max ranks field for given government alt type.
     *
     * @param string $altTypeSlug Slugged alt type.
     *
     * @return array
     */
    private function getMaxRanksFields($altTypeSlug)
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

        switch ($altTypeSlug) {
            case 'City':
                $callback = function ($name) {
                    return ('frpmRate' !== $name) &&
                    ('academicPerformanceIndex' !== $name) &&
                    ('satScores' !== $name) &&
                    ('graduationRate' !== $name) &&
                    ('dropoutRate' !== $name) &&
                    ('expenditurePerStudent' !== $name) &&
                    ('enrollment' !== $name);
                };
                break;

            case 'County':
                $callback = function ($name) {
                    return ('frpmRate' !== $name) &&
                    ('medianTotalCompOverMedianIndividualComp' !== $name) &&
                    ('academicPerformanceIndex' !== $name) &&
                    ('enrollment' !== $name);
                };
                break;

            case 'School_District':
                $callback = function ($name) {
                    return ('violentCrimesPer100000Population' !== $name) &&
                    ('propertyCrimesPer100000Population' !== $name) &&
                    ('fullTimeEmployeesOverPopulation' !== $name) &&
                    ('salesTaxRate' !== $name) &&
                    ('libraryHoursPerWeek' !== $name) &&
                    ('changeInGovernmentalFundRevenue' !== $name) &&
                    ('defaultProbability' !== $name) &&
                    ('publicSafetyExpOverTotGovFundRevenue' !== $name) &&
                    ('publicSafetyExpOverGeneralFundRevenue' !== $name) &&
                    ('totalRevenuePerCapita' !== $name) &&
                    ('totalExpendituresPerCapita' !== $name) &&
                    ('medianTotalCompGeneralPublic' !== $name) &&
                    ('medianHomePrice' !== $name) &&
                    ('population' !== $name);
                };
                break;

            case 'Special_District':
                $callback = function ($name) {
                    return  ('frpmRate' !== $name) &&
                    ('violentCrimesPer100000Population' !== $name) &&
                    ('propertyCrimesPer100000Population' !== $name) &&
                    ('academicPerformanceIndex' !== $name) &&
                    ('satScores' !== $name) &&
                    ('salesTaxRate' !== $name) &&
                    ('libraryHoursPerWeek' !== $name) &&
                    ('graduationRate' !== $name) &&
                    ('dropoutRate' !== $name) &&
                    ('expenditurePerStudent' !== $name) &&
                    ('changeInGovernmentalFundRevenue' !== $name) &&
                    ('publicSafetyExpOverTotGovFundRevenue' !== $name) &&
                    ('publicSafetyExpOverGeneralFundRevenue' !== $name) &&
                    ('totalRevenuePerCapita' !== $name) &&
                    ('totalExpendituresPerCapita' !== $name) &&
                    ('medianTotalCompGeneralPublic' !== $name) &&
                    ('medianHomePrice' !== $name) &&
                    ('population' !== $name) &&
                    ('enrollment' !== $name);
                };
                break;

            default:
                throw new \InvalidArgumentException("Unknown alt type '$altTypeSlug'");
        }

        return array_filter($maxRanksFields, $callback);
    }
}
