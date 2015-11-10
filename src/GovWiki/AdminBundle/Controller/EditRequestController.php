<?php

namespace GovWiki\AdminBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Exception\HttpException;
use GovWiki\DbBundle\Entity\EditRequest;

/**
 * EditRequestController
 */
class EditRequestController extends Controller
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

        $editRequestsQuery = $em->createQuery(
            'SELECT er FROM GovWikiDbBundle:EditRequest er
            LEFT JOIN er.user u
            WHERE er.status != :status
            ORDER BY er.created DESC'
        )->setParameter('status', 'discarded');

        $editRequests = $this->get('knp_paginator')->paginate(
            $editRequestsQuery,
            $request->query->getInt('page', 1),
            50
        );

        return ['editRequests' => $editRequests];
    }

    /**
     * @Route("/{id}")
     * @Template
     *
     * @param EditRequest $editRequest A EditRequest instance.
     *
     * @return array
     */
    public function showAction(EditRequest $editRequest)
    {
        $em = $this->getDoctrine()->getManager();
        $errors = [];

        try {
            $targetEntity = $em->getRepository("GovWikiDbBundle:{$editRequest->getEntityName()}")->find($editRequest->getEntityId());
        } catch (\Doctrine\Common\Persistence\Mapping\MappingException $e) {
            $targetEntity = null;
            $errors[]     = "Can't find entity with name '{$editRequest->getEntityName()}', due to bad entry or internal system error";
        }

        $governmentName = '';
        if (is_object($targetEntity)) {
            if (method_exists($targetEntity, 'getGovernment')) {
                $governmentName = $targetEntity->getGovernment()->getName();
            } elseif (method_exists($targetEntity, 'getElectedOfficial')) {
                $governmentName = $targetEntity->getElectedOfficial()->getGovernment()->getName();
            }
        }

        $changes = [];
        foreach ($editRequest->getChanges() as $field => $newValue) {
            $changes[] = [
                'correct'  => method_exists($targetEntity, 'get'.ucfirst($field)),
                'field'    => $field,
                'newValue' => $newValue,
            ];
        }

        return [
            'editRequest'    => $editRequest,
            'targetEntity'   => $targetEntity,
            'governmentName' => $governmentName,
            'changes'        => $changes,
            'errors'         => $errors,
        ];
    }

    /**
     * @Route("/{id}/apply")
     *
     * @param EditRequest $editRequest A EditRequest instance.
     *
     * @return JsonResponse
     */
    public function applyAction(EditRequest $editRequest)
    {
        $em = $this->getDoctrine()->getManager();

        $targetEntity = $em->getRepository("GovWikiDbBundle:{$editRequest->getEntityName()}")->find($editRequest->getEntityId());

        foreach ($editRequest->getChanges() as $field => $newValue) {
            if (method_exists($targetEntity, 'get'.ucfirst($field))) {
                $setter = 'set'.ucfirst($field);
                $targetEntity->$setter($newValue);
            }
        }

        $editRequest->setStatus('applied');

        $em->flush();

        return new JsonResponse(['redirect' => $this->generateUrl('govwiki_admin_editrequest_index')]);
    }

    /**
     * @Route("/{id}/discard")
     *
     * @param EditRequest $editRequest
     * @return JsonResponse
     */
    public function discardAction(EditRequest $editRequest)
    {
        $em = $this->getDoctrine()->getManager();
        $editRequest->setStatus('discarded');
        $em->flush();

        return new JsonResponse(['redirect' => $this->generateUrl('govwiki_admin_editrequest_index')]);
    }

    /**
     * @Route("/{id}/remove")
     *
     * @param  EditRequest $editRequest
     * @return JsonReponse
     */
    public function removeAction(EditRequest $editRequest)
    {
        $em = $this->getDoctrine()->getManager();
        $em->remove($editRequest);
        $em->flush();

        return new JsonResponse(['status' => 'ok']);
    }
}
