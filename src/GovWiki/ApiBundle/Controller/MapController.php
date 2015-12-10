<?php

namespace GovWiki\ApiBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;
use Symfony\Component\HttpFoundation\JsonResponse;

/**
 * Class MapController
 * @package GovWiki\ApiBundle\Controller
 *
 * @Configuration\Route("/map")
 */
class MapController extends AbstractGovWikiController
{
    /**
     * @Configuration\Route()
     *
     * @return JsonResponse
     */
    public function indexAction()
    {
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
