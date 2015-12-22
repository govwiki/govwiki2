<?php

namespace GovWiki\ApiBundle\Controller\V1;

use CartoDbBundle\CartoDbServices;
use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class MapController
 * @package GovWiki\ApiBundle\Controller
 *
 * @Configuration\Route("/map")
 */
class MapController extends AbstractGovWikiApiController
{
    /**
     * @Configuration\Route()
     *
     * @return JsonResponse
     */
    public function indexAction()
    {
        $this->environmentManager();

        try {
            $map = $this->environmentManager()->getMap();
        } catch (\Exception $e) {
            return new JsonResponse([
                'status' => 'critical',
                'message' => $e->getMessage(),
            ]);
        }

        if (null === $map) {
            return $this->notFoundResponse(
                "Can't find map with name '{$this->environmentManager()->getEnvironment()}'."
            );
        }

        return $this->successResponse($map);
    }

    /**
     * @Configuration\Route("/check", methods={"GET"})
     *
     * @param Request $request A Request instance.
     *
     * @return JsonResponse
     */
    public function checkAction(Request $request)
    {
        return new JsonResponse($this->get(CartoDbServices::CARTO_DB_API)
            ->checkImportProcess($request->query->get('item_queue_id')));
    }
}
