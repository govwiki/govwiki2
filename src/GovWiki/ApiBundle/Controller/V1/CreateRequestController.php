<?php

namespace GovWiki\ApiBundle\Controller\V1;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Exception\HttpException;
use GovWiki\DbBundle\Entity\CreateRequest;

/**
 * CreateRequestController
 */
class CreateRequestController extends Controller
{
    /**
     * @Route("new")
     * @Security("is_granted('ROLE_USER')")
     *
     * @param Request $request A Request instance.
     *
     * @return Response|JsonResponse
     */
    public function newAction(Request $request)
    {
        if (!$request->isXmlHttpRequest()) {
            $data        = $request->request->get('createRequest');

            $knownFields = $data['knownFields'];
            $knownFields = empty($knownFields) ? [] : $knownFields;

            $errors = $this->getErrors($data);
            if (!empty($errors)) {
                return new JsonResponse(['errors' => $errors], 400);
            }

            $em = $this->getDoctrine()->getManager();

            /** @var \Doctrine\ORM\Mapping\ClassMetadata $metaData */
            $metaData = $em->getClassMetaData("GovWikiDbBundle:{$data['entityName']}");

            $response = [];

            $response['fields'] = $metaData->getFieldNames();
            if ($response['fields'][0] === 'id') {
                unset($response['fields'][0]);
            }

            $associationMappings = $metaData->getAssociationMappings();

            if ('Legislation' === $data['entityName']) {
                /*
                 * Don't send information about votes and governments.
                 */
                $knownFields['electedOfficialVotes'] = true;
                $knownFields['government'] = true;
            }
            foreach ($associationMappings as $associationFieldName => $associationMapping) {
                if (array_key_exists($associationFieldName, $knownFields)) {
                    if ('electedOfficialVotes' === $associationFieldName) {
                        /*
                         * Fetch information about all elected officials on this.
                         */
                        $response['electedOfficials'] = $em->getRepository('GovWikiDbBundle:Government')->governmentElectedOfficial((int) $knownFields['electedOfficial']);
                    }
                    unset($associationMappings[$associationFieldName]);
                } else {
                    $choicesObject = $em->getRepository($associationMapping['targetEntity'])->findAll();
                    $choices = [];
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
            throw new HttpException(400);
        }
    }

    /**
     * @Route("create")
     *
     * @param Request $request A Request instance.
     *
     * @return Response|JsonResponse
     */
    public function createAction(Request $request)
    {
        if ($request->isXmlHttpRequest()) {
            if ($this->getUser() and $this->getUser()->hasRole('ROLE_USER')) {
                $data = $request->request->get('createRequest');


                $errors = $this->getErrors($data);
                if (!empty($errors)) {
                    return new JsonResponse(['errors' => $errors], 400);
                }

                $createRequest = new CreateRequest();
                $createRequest->setEntityName($data['entityName'])
                              ->setFields($data['fields'])
                              ->setUser($this->getUser());

                $em = $this->getDoctrine()->getManager();
                $em->persist($createRequest);
                $em->flush();

                return new JsonResponse(['message' => 'We save your edit request. Thank you!'], 200);
            } else {
                return new Response(null, 401);
            }
        } else {
            throw new HttpException(400);
        }
    }

    /**
     * @param array $data Create request data.
     *
     * @return array
     */
    private function getErrors(array $data = [])
    {
        $errors = [];

        if (empty($data['entityName'])) {
            $errors[] = 'Empty entity name';
        }

        $em = $this->getDoctrine()->getManager();

        try {
            $em->getClassMetaData("GovWikiDbBundle:{$data['entityName']}");
        } catch (\Doctrine\Common\Persistence\Mapping\MappingException $e) {
            $errors[] = "Can't find entity with name '{$data['entityName']}', due to bad entry or internal system error";
        }

        return $errors;
    }
}
