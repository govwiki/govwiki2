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
     * @param string $environment Given by
     *                            {@see EnvironmentListener}.
     *
     * @return JsonResponse
     */
    public function indexAction($environment)
    {
        try {
            $env = $this->getDoctrine()
                ->getRepository('GovWikiDbBundle:Environment')
                ->getByName($environment);
        } catch (\Exception $e) {
            return new JsonResponse([
                'status' => 'critical',
                'message' => $e->getMessage(),
            ]);
        }

        if (null === $env) {
            return $this->notFoundResponse(
                "Can't find environment with name '$environment'."
            );
        }

        return $this->successResponse($env);
    }
}
