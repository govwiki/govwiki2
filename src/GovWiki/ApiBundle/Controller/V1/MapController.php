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
        $this->getEnvironmentManager();

        try {
            $map = $this->getEnvironmentManager()->getMap();
        } catch (\Exception $e) {
            return new JsonResponse([
                'status' => 'critical',
                'message' => $e->getMessage(),
            ]);
        }

        if (null === $map) {
            return $this->notFoundResponse(
                "Can't find map with name '{$this->getEnvironmentManager()->getEnvironment()}'."
            );
        }

        return $this->successResponse($map);
    }
}
