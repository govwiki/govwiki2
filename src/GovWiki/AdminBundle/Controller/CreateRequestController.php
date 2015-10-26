<?php

namespace GovWiki\AdminBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Exception\HttpException;
use GovWiki\DbBundle\Entity\CreateRequest;

/**
 * CreateRequestController
 */
class CreateRequestController extends Controller
{
    /**
     * @Route("/")
     * @Template
     *
     * @param Request $request
     * @return Response
     */
    public function indexAction(Request $request)
    {
        $em = $this->getDoctrine()->getManager();

        $createRequestsQuery = $em->createQuery(
            'SELECT cr FROM GovWikiDbBundle:CreateRequest cr
            LEFT JOIN cr.user u
            WHERE cr.status != :status
            ORDER BY cr.created DESC'
        )->setParameter('status', 'discarded');

        $createRequests = $this->get('knp_paginator')->paginate(
            $createRequestsQuery,
            $request->query->getInt('page', 1),
            50
        );

        return ['createRequests' => $createRequests];
    }

    /**
     * @Route("/{id}")
     * @Template
     *
     * @param CreateRequest $createRequest
     * @return Response
     */
    public function showAction(CreateRequest $createRequest)
    {
        dump($createRequest);
        $em = $this->getDoctrine()->getManager();
        $errors = [];

        try {
            $targetClassMetadata = $em->getClassMetadata("GovWikiDbBundle:{$createRequest->getEntityName()}");
        } catch (\Doctrine\Common\Persistence\Mapping\MappingException $e) {
            $targetClassMetadata = null;
            $errors[] = "Can't find entity with name '{$createRequest->getEntityName()}', due to bad entry or internal system error";
        }

        $newEntity = $targetClassMetadata->newInstance();

        $data = $createRequest->getFields();

        $associations = [];
        foreach ($data['associations'] as $association => $id) {
            $correctAssociation = true;
            $associationName    = '';
            try {
                $associationRepository = $em->getRepository("GovWikiDbBundle:{$association}");
            } catch (\Doctrine\Common\Persistence\Mapping\MappingException $e) {
                $associationRepository = null;
                $correctAssociation = false;
            }

            if ($correctAssociation) {
                $associationEntity = $associationRepository->find($id);
                if ($associationEntity) {
                    if (method_exists($associationEntity, '__toString')) {
                        $associationName = (string) $associationEntity;
                    } else {
                        $associationName = 'Can\'t display name';
                    }
                } else {
                    $correctAssociation = false;
                }
            }

            $associations[] = [
                'field'   => $association,
                'name'    => $associationName,
                'correct' => $correctAssociation,
            ];
        }

        $childs = [];
        if (!empty($data['childs'])) {
            foreach ($data['childs'] as $child) {
                dump($child);
                $correctChild = true;
                try {
                    $childClassMetadata = $em->getClassMetadata("GovWikiDbBundle:{$child['entityName']}");
                } catch (\Doctrine\Common\Persistence\Mapping\MappingException $e) {
                    $childClassMetadata = null;
                    $correctChild = false;
                }

                if ($correctChild) {
                    $newChildEntity = $childClassMetadata->newInstance();
                    foreach ($child['fields']['fields'] as $field => $value) {
                        $correctField = true;
                        $setter = 'set'.ucfirst($field);

                        if (!method_exists($newChildEntity, $setter)) {
                            $correctField = false;
                        }

                        $childFields[] = [
                            'field'   => $field,
                            'value'   => $value,
                            'correct' => $correctField,
                        ];
                    }

                    foreach ($child['fields']['associations'] as $field => $value) {
                        $correctField = true;
                        $setter = 'set'.ucfirst($field);

                        if (!method_exists($newChildEntity, $setter)) {
                            $correctField = false;
                        }

                        $childFields[] = [
                            'field'   => $field,
                            'value'   => $value,
                            'correct' => $correctField,
                        ];
                    }
                }

                $childs[] = [
                    'dataType'     => $child['entityName'],
                    'fields'       => $childFields,
                    'associations' => $childAssociations,
                    'correct'      => $correctChild,
                ];

                $childFields       = [];
                $childAssociations = [];
            }
        }

        $fields = [];
        foreach ($data['fields'] as $field => $value) {
            $correctField = true;
            $setter = 'set'.ucfirst($field);

            if (!method_exists($newEntity, $setter)) {
                $correctField = false;
            }

            $fields[] = [
                'field'   => $field,
                'value'   => $value,
                'correct' => $correctField,
            ];
        }
        dump($childs);
        // die;
        return [
            'createRequest' => $createRequest,
            'fields'        => $fields,
            'associations'  => $associations,
            'childs'        => $childs,
            'errors'        => $errors,
        ];
    }

    /**
     * @Route("/{id}/apply")
     *
     * @param CreateRequest $createRequest
     * @return JsonResponse
     */
    public function applyAction(CreateRequest $createRequest)
    {
        $em = $this->getDoctrine()->getManager();

        $targetClassMetadata = $em->getClassMetadata("GovWikiDbBundle:{$createRequest->getEntityName()}");
        $newEntity = $targetClassMetadata->newInstance();

        $data = $createRequest->getFields();

        foreach ($data['associations'] as $association => $id) {
            $correctAssociation = true;
            $associationName    = '';
            try {
                $associationRepository = $em->getRepository("GovWikiDbBundle:{$association}");
            } catch (\Doctrine\Common\Persistence\Mapping\MappingException $e) {
                $associationRepository = null;
                $correctAssociation = false;
            }

            if ($correctAssociation) {
                $associationEntity = $associationRepository->find($id);
                if ($associationEntity) {
                    $associationSetter = 'set'.ucfirst($association);
                    $newEntity->$associationSetter($associationEntity);
                }
            }
        }

        foreach ($data['fields'] as $field => $value) {
            $correctField = true;
            $setter = 'set'.ucfirst($field);

            if (method_exists($newEntity, $setter)) {
                $newEntity->$setter($value);
            }
        }

        $createRequest->setStatus('applied');

        $em->persist($newEntity);
        $em->flush();

        return new JsonResponse(['redirect' => $this->generateUrl('govwiki_admin_createrequest_index')]);
    }

    /**
     * @Route("/{id}/discard")
     *
     * @param CreateRequest $createRequest
     * @return JsonResponse
     */
    public function discardAction(CreateRequest $createRequest)
    {
        $em = $this->getDoctrine()->getManager();
        $createRequest->setStatus('discarded');
        $em->flush();

        return new JsonResponse(['redirect' => $this->generateUrl('govwiki_admin_createrequest_index')]);
    }

    /**
     * @Route("/{id}/remove")
     *
     * @param  CreateRequest $createRequest
     * @return JsonReponse
     */
    public function removeAction(CreateRequest $createRequest)
    {
        $em = $this->getDoctrine()->getManager();
        $em->remove($createRequest);
        $em->flush();

        return new JsonResponse(['status' => 'ok']);
    }
}
