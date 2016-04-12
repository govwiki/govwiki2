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
     * Return array of appropriate governments as array of its id, name, alt
     * type and array of available years.
     *
     * Return array fo matched governments as object, for example:
     * {
     *  "id": 4104,
     *  "name": "CITY OF TUSTIN",
     *  "altType": "City",
     *  "years": [
     *      2014
     *      2013
     *  ]
     * }
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

        return new JsonResponse($this->getEnvironmentManager()
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
     *          "year": 2014,
     *          "altType": "City"
     *      },
     *      {
     *          "id": 4087,
     *          "year": 2014,
     *          "altType": "City"
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
            ->getCategoriesForComparisonByGovernment($data['captions']);

        $translator = $this->get('translator');

        $captions = array_map(
            function (array $caption) use ($translator) {

                if (null !== $caption['fieldName']) {
                    $nameKey = 'format.'. $caption['fieldName'];
                    $tabKey = 'groups.group_id_'. $caption['tab_id'];
                } else {
                    $nameKey = 'findata.captions.'. $this->getTransKey($caption['name']);
                    $tabKey = 'gov.'. $this->getTransKey($caption['tab']);
                }

                $caption['translatedName'] = $translator->trans($nameKey);
                $caption['translatedTab'] = $translator->trans($tabKey);

                if (null !== $caption['category']) {
                    $categoryKey = 'caption_categories.'.
                        $this->getTransKey($caption['category']);
                    $caption['translatedCategory'] = $translator->trans($categoryKey);
                }

                return $caption;
            },
            $captions
        );

        return new JsonResponse($captions);
    }

    /**
     *
     * @Route("/compare", methods={"POST"})
     *
     * Compare given governments.
     * Require 'application/json' Content-Type.
     *
     * Example for financial statement category:
     * {
     *  "firstGovernment": {
     *      "id": 4104,
     *      "year": 2014
     *  },
     *  "secondGovernment": {
     *      "id": 4087,
     *      "year": 2014
     *  },
     *  "category": "Revenue"
     * }
     *
     * Example for financial statement:
     * {
     *  "firstGovernment": {
     *      "id": 4104,
     *      "year": 2014
     *  },
     *  "secondGovernment": {
     *      "id": 4087,
     *      "year": 2014
     *  },
     *  "caption": "Capital Outlay",
     *  "tab": "Financial Statements"
     * }
     *
     * Example for over tab:
     * {
     *  "firstGovernment": {
     *      "id": 4104,
     *      "year": 2014
     *  },
     *  "secondGovernment": {
     *      "id": 4087,
     *      "year": 2014
     *  },
     *  "caption": "Median Benefits for Full Time Employees",
     *  "fieldName": "median_benefits_for_full_time_employees",
     *  "tab": "Employee Compensation"
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

        /*
         * Translate data.
         */
        $translator = $this->get('translator');

        // Translate governments data.
        foreach ($result['firstGovernment']['data'] as &$row) {
            $captionKey = 'findata.captions.'. $this->getTransKey($row['caption']);
            $row['translatedCaption'] = $translator->trans($captionKey);

            if (array_key_exists('category', $row)) {
                $categoryKey = 'general.findata.main.'. $this->getTransKey($row['category']);
                $row['translatedCategory'] = $translator->trans($categoryKey);
            }
        }
        foreach ($result['secondGovernment']['data'] as &$row) {
            $captionKey = 'findata.captions.'. $this->getTransKey($row['caption']);
            $row['translatedCaption'] = $translator->trans($captionKey);

            if (array_key_exists('category', $row)) {
                $categoryKey = 'general.findata.main.'. $this->getTransKey($row['category']);
                $row['translatedCategory'] = $translator->trans($categoryKey);
            }
        }


        // Translate category and tab name.
        if (array_key_exists('category', $result)) {
            $result['translatedCategory'] = $translator->trans(
                'general.findata.main.' . $this->getTransKey($result['category'])
            );
        }

        // Hardcoded, replace.
        $tabName = $result['tab'];
        if ('Financial Statement' === $result['tab']) {
            $tabName .= 's';
        }
        $result['translatedTab'] = $translator->trans(
            'gov.'. $this->getTransKey($tabName)
        );

        return new JsonResponse($result);
    }

    /**
     * @param $string
     *
     * @return string
     */
    private function getTransKey($string) {
        return strtr(strtolower($string), [
            ' ' => '_',
            '-' => '_d_',
            '&' => 'amp',
            ',' => '_c_',
            '(' => 'lb',
            ')' => 'rb',
            '/' => 'sl',
            '%' => 'proc',
            "'" => '_apos_',
        ]);
    }
}
