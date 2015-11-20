<?php

namespace GovWiki\ApiBundle\Controller;

use Doctrine\ORM\EntityManagerInterface;
use GovWiki\DbBundle\Entity\Repository\GovernmentRepository;
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
     * @param  string $altTypeSlug Government alt type.
     * @param  string $slug        Government slugged name.
     *
     * @return Response
     */
    public function showAction($altTypeSlug, $slug)
    {
        /** @var EntityManagerInterface $em */
        $em = $this->getDoctrine()->getManager();
        $context = SerializationContext::create()
            ->setGroups('government')
            ->enableMaxDepthChecks();

        $government = $this->get('jms_serializer')->serialize(
            $em->getRepository('GovWikiDbBundle:Government')
                ->findGovernment($altTypeSlug, $slug),
            'json',
            $context
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
     * @param  Request $request A Request instance.
     *
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

    /**
     * @Route("/{altTypeSlug}/{slug}/get_ranks", methods={"GET"})
     *
     * Query parameters:
     *  field_name - field name in camelCase.
     *  limit      - max entities per request, default 25.
     *  page       - calculate offset based on this value, default null.
     *  order      - sorting order by given field_name, 'desc' or 'asc',
     *               default null.
     *  name_order - sorting order by government name, 'desc' or 'asc',
     *               default null.
     *
     * @param Request $request     A Request instance.
     * @param string  $altTypeSlug Alt type slug.
     * @param string  $slug        Government slug.
     *
     * @return JsonResponse
     */
    public function getRanksAction(Request $request, $altTypeSlug, $slug)
    {
        /** @var GovernmentRepository $repository */
        $repository = $this->getDoctrine()->getRepository("GovWikiDbBundle:Government");
        $fieldName = $request->query->get('field_name', null);
        if (empty($fieldName)) {
            return new JsonResponse([ 'message' => 'Provide field_name query parameter.' ], 400);
        }

        /*
         * Check field name.
         */
        $fields = $this->getDoctrine()->getManager()->getClassMetadata('GovWikiDbBundle:Government')
            ->getFieldNames();
        $found = false;
        foreach ($fields as $field) {
            if ($field === $fieldName) {
                $found = true;
                break;
            }
        }
        if (! $found) {
            return new JsonResponse([ 'message'  => 'Unknown field name, provide in camel case like in Government entity.'], 400);
        }

        $data = $repository->getGovernmentRank(
            $altTypeSlug,
            $slug,
            $fieldName,
            $request->query->getInt('limit', 25),
            $request->query->get('page', 0),
            $request->query->get('order', null),
            $request->query->get('name_order', null)
        );

        /*
         * Canonize field name and value.
         */
        foreach ($data as &$row) {
            $row['name'] = str_replace('_', ' ', $row['name']);
        }

        return new JsonResponse([
            'data' => $data,
            'alt_type' => str_replace('_', ' ', $altTypeSlug),
        ]);
    }
}
