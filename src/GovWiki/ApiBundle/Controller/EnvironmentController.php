<?php

namespace GovWiki\ApiBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;
use Symfony\Component\HttpFoundation\JsonResponse;

/**
 * Class EnvironmentController
 * @package GovWiki\ApiBundle\Controller
 *
 * @Configuration\Route("/env")
 */
class EnvironmentController extends AbstractGovWikiController
{
    /**
     * @Configuration\Route("/{name}/map")
     *
     * @param string $name A Environment name.
     *
     * @return JsonResponse
     */
    public function indexAction($name)
    {
        try {
            $env = $this->getDoctrine()
                ->getRepository('GovWikiDbBundle:Environment')
                ->getByName($name);
        } catch (\Exception $e) {
            return new JsonResponse([
                'status' => 'critical',
                'message' => $e->getMessage(),
            ]);
        }

        if (null === $env) {
            return $this->notFoundResponse("Can't find env with name '$name'.");
        }

        return $this->successResponse($env);
    }
}
