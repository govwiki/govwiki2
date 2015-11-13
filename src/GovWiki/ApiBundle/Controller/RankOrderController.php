<?php

namespace GovWiki\ApiBundle\Controller;

use GovWiki\DbBundle\Entity\MaxRank;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;

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
     *  alt type - alt type.
     *  limit    - max entities per request, default 25.
     *  page     - calculate offset based on this value, default null.
     *  order    - sorting order, 'desc' or 'asc', default null.
     *
     * @return JsonResponse
     */
    public function listAction()
    {
        $fields = $this->getDoctrine()->getManager()
            ->getClassMetadata('GovWikiDbBundle:MaxRank')
            ->getFieldNames();

        /*
         * Fetch max ranks.
         */
        /** @var MaxRank[] $result */
        $tmp = $this->getDoctrine()->getRepository('GovWikiDbBundle:MaxRank')
                ->findAll();
        $maxRanks = [];
        foreach ($tmp as $maxRank) {
            /*
             * Get all fields without id and altType.
             */
            $result = [];
            foreach ($fields as $field) {
                if ($field !== 'id' && $field !== 'altType') {
                    $value = call_user_func(
                        [
                            $maxRank,
                            'get'. ucfirst($field),
                        ]
                    );
                    if ($value) {
                        $result[] = [
                            'name' => ucfirst(preg_replace('/([A-Z])/', ' $1', $field)),
                            'value' => $value,
                        ];
                    }
                }
            }
            $maxRanks[$this->canonizeAltType($maxRank->getAltType())] = $result;
        }



        /*
         * Fetch governments.
         */
        $data = $this->getDoctrine()->getRepository('GovWikiDbBundle:Government')
            ->getGovernments();
        $governments = [];
        $currentAltType = $data[0]['altType'];
        $buf = [];
        foreach ($data as $row) {
            if ($currentAltType !== $row['altType']) {
                $governments[$currentAltType] = $buf;
                $currentAltType = $row['altType'];
            }

            unset($row['altType']);
            $buf[] = $row;
        }
        /*
         * Add last set.
         */
        $governments[$this->canonizeAltType($currentAltType)] = $buf;

        return new JsonResponse([
            'maxRanks' => $maxRanks,
            'governments' => $governments,
        ]);
    }

    /**
     * @param string $altType Alt type to canonize.
     *
     * @return string
     */
    private function canonizeAltType($altType)
    {
        return str_replace(' ', '_', strtolower($altType));
    }
}
