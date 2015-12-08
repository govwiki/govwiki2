<?php

namespace GovWiki\ApiBundle\Controller;

use JMS\Serializer\SerializationContext;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

/**
 * Class AbstractGovWikiController
 * @package GovWiki\ApiBundle\Controller
 */
class AbstractGovWikiController extends Controller
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

//        $data = [
//            'status' => 'success',
//            'data' => $data,
//        ];

        $response = new Response();
        $response->setContent($serializer->serialize($data, 'json', $context));
        $response->headers->set('Content-Type', 'application/json');
        return $response;
    }
}
