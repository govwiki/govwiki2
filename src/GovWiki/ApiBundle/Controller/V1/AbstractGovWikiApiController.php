<?php

namespace GovWiki\ApiBundle\Controller\V1;

use Doctrine\ORM\Tools\Pagination\Paginator;
use GovWiki\ApiBundle\GovWikiApiServices;
use JMS\Serializer\SerializationContext;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

/**
 * Class AbstractGovWikiApiController
 * @package GovWiki\ApiBundle\Controller
 */
abstract class AbstractGovWikiApiController extends Controller
{
    /**
     * @param string $message Error message.
     *
     * @return JsonResponse
     */
    protected function notFoundResponse($message)
    {
        return new JsonResponse([
            'status' => 'error',
            'message' => $message
        ], 404);
    }

    /**
     * @param array|object|string $data Sending data.
     *
     * @return JsonResponse
     */
    protected function successResponse($data)
    {
        return new JsonResponse([
            'status' => 'success',
            'data' => $data,
        ]);
    }

    /**
     * @param Paginator $paginator A Paginator instance.
     *
     * @return Response
     */
    protected function paginatorResponse(Paginator $paginator)
    {
        $data = $this->get('jms_serializer')
            ->serialize(
                [
                    'status' => 'success',
                    'data' => iterator_to_array($paginator),
                    'count' => $paginator->count(),
                ],
                'json',
                (new SerializationContext())->setGroups([ 'government_list' ])
            );

        return new Response(
            $data,
            200,
            [ 'Content-Type' => 'application/json' ]
        );
    }

    /**
     * @param array|object $data   Data to serialize.
     * @param array        $groups Serialization group.
     *
     * @return mixed
     */
    protected function serializedResponse($data, array $groups = [])
    {
        $serializer = $this->get('jms_serializer');
        $context = new SerializationContext();

        if (count($groups) > 0) {
            $context->setGroups($groups);
        }

        $data = [
            'status' => 'success',
            'data' => $data,
        ];

        $response = new Response();
        $response->setContent($serializer->serialize($data, 'json', $context));
        $response->headers->set('Content-Type', 'application/json');
        return $response;
    }

    /**
     * @return \GovWiki\ApiBundle\Manager\EnvironmentManager
     */
    protected function environmentManager()
    {
        return $this->get(GovWikiApiServices::ENVIRONMENT_MANAGER);
    }
}
