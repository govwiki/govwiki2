<?php

namespace GovWiki\ApiBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Exception\HttpException;

/**
 * CreateRequestController
 */
class CreateRequestController extends Controller
{
    /**
     * @Route("new")
     *
     * @param Request $request
     * @return Response|JsonResponse
     */
    public function newAction(Request $request)
    {
        if ($request->isXmlHttpRequest()) {
            if ($this->getUser() and $this->getUser()->hasRole('ROLE_USER')) {
                $data        = $request->request->get('createRequest');

                $knownFields = $data['knownFields'];
                $knownFields = empty($knownFields) ? [] : $knownFields;

                $errors = [];
                if (empty($data['entityName'])) {
                    $errors[] = 'Empty entity name';
                }

                $em = $this->getDoctrine()->getManager();

                try {
                    $metaData = $em->getClassMetaData("GovWikiDbBundle:{$data['entityName']}");
                } catch (\Doctrine\Common\Persistence\Mapping\MappingException $e) {
                    $metaData = null;
                    $errors[] = "Can't find entity with name '{$data['entityName']}', due to bad entry or internal system error";
                }

                if (!empty($errors)) {
                    return new JsonResponse(['errors' => $errors], 400);
                }

                $response = [];

                $response['fields'] = $metaData->getFieldNames();
                if ($response['fields'][0] === 'id') {
                    unset($response['fields'][0]);
                }

                $associationMappings = $metaData->getAssociationMappings();
                foreach ($associationMappings as $associationFieldName => $associationMapping) {
                    if (array_key_exists($associationFieldName, $knownFields)) {
                        unset($associationMappings[$associationFieldName]);
                    } else {
                        $choicesObject = $em->getRepository($associationMapping['targetEntity'])->findAll();
                        foreach ($choicesObject as $choiceObject) {
                            $choices[] = [$choiceObject->getId() => (string) $choiceObject];
                        }
                        $response['choices'][] = [
                            'name'    => $associationFieldName,
                            'choices' => $choices,
                        ];
                    }
                }

                return new JsonResponse($response);
            } else {
                return new Response(null, 401);
            }
        } else {
            throw new HttpException(400);
        }
    }
}
