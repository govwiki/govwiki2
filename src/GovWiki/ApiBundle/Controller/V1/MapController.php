<?php

namespace GovWiki\ApiBundle\Controller\V1;

use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;
use Symfony\Component\HttpFoundation\JsonResponse;

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
}
