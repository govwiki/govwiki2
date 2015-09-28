<?php

namespace GovWiki\ApiBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use JMS\Serializer\SerializationContext;

/**
 * GovernmentController
 */
class GovernmentController extends Controller
{
    /**
     * @Route("/{altTypeSlug}/{slug}", methods="GET")
     *
     * @param  string $altTypeSlug
     * @param  string $slug
     * @return Response
     */
    public function showAction($altTypeSlug, $slug)
    {
        $em = $this->getDoctrine()->getManager();

        $government = $em->getRepository('GovWikiDbBundle:Government')->findGovernment(
            $altTypeSlug,
            $slug,
            $this->get('jms_serializer')
        );

        $response = new Response();
        $response->setContent($government);
        $response->headers->set('Content-Type', 'application/json');

        return $response;
    }

    /**
     * @Route("/get-markers-data", methods="GET")
     *
     * Get markers data
     *
     * @param  Request $request
     * @return JsonResponse
     */
    public function getMarkersDataAction(Request $request)
    {
        $em = $this->getDoctrine()->getManager();

        if ($limit = $request->query->get('limit')) {
            $data = $em->getRepository('GovWikiDbBundle:Government')->getMarkers($request->query->get('altTypes'), $limit);
        } else {
            $data = $em->getRepository('GovWikiDbBundle:Government')->getMarkers($request->query->get('altTypes'));
        }

        return new JsonResponse($data);
    }
}
