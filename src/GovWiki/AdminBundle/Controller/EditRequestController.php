<?php

namespace GovWiki\AdminBundle\Controller;

use GovWiki\DbBundle\Entity\Repository\EditRequestRepository;
use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use GovWiki\DbBundle\Entity\EditRequest;

/**
 * Class EditRequestController
 * @package GovWiki\AdminBundle\Controller
 *
 * @Configuration\Route(
 *  "/{environment}/edit-request",
 *  requirements={ "environment": "\w+" }
 * )
 */
class EditRequestController extends AbstractGovWikiAdminController
{
    /**
     * @Configuration\Route("/")
     * @Configuration\Template
     *
     * @param Request $request A Request instance.
     *
     * @return array
     */
    public function indexAction(Request $request)
    {
        /** @var EditRequestRepository $repository */
        $repository = $this->getDoctrine()
            ->getRepository('GovWikiDbBundle:EditRequest');

        $editRequests = $repository
            ->getListQuery($this->getCurrentEnvironment()->getId());

        $editRequests = $this->paginate(
            $editRequests,
            $request->query->getInt('page', 1),
            50
        );

        return [ 'editRequests' => $editRequests ];
    }

    /**
     * @Configuration\Route(
     *  "/{id}",
     *  requirements={ "id": "\d+" }
     * )
     * @Configuration\Template
     *
     * @param EditRequest $editRequest A EditRequest entity instance.
     *
     * @return array
     */
    public function showAction(EditRequest $editRequest)
    {
        $em = $this->getDoctrine()->getManager();
        $errors = [];

        $entityName = $editRequest->getEntityName();

        try {
            $targetEntity = $em
                ->getRepository("GovWikiDbBundle:{$entityName}")
                ->find($editRequest->getEntityId());
        } catch (\Doctrine\Common\Persistence\Mapping\MappingException $e) {
            $targetEntity = null;
            $errors[]     = "Can't find entity with name '{$entityName}', due ".
                'to bad entry or internal system error';
        }

        $governmentName = '';
        if (is_object($targetEntity)) {
            if (method_exists($targetEntity, 'getGovernment')) {
                $governmentName = $targetEntity->getGovernment()->getName();
            } elseif (method_exists($targetEntity, 'getElectedOfficial')) {
                $governmentName = $targetEntity->getElectedOfficial()
                    ->getGovernment()
                    ->getName();
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
     * @Configuration\Route(
     *  "/{id}/apply",
     *  requirements={ "id": "\d+" }
     * )
     *
     * @param EditRequest $editRequest A EditRequest entity instance.
     *
     * @return JsonResponse
     */
    public function applyAction(EditRequest $editRequest)
    {
        $em = $this->getDoctrine()->getManager();

        $targetEntity = $em
            ->getRepository("GovWikiDbBundle:{$editRequest->getEntityName()}")
            ->find($editRequest->getEntityId());

        foreach ($editRequest->getChanges() as $field => $newValue) {
            if (method_exists($targetEntity, 'get'.ucfirst($field))) {
                $setter = 'set'.ucfirst($field);
                $targetEntity->$setter($newValue);
            }
        }

        $editRequest->setStatus('applied');

        $em->flush();

        return new JsonResponse([
            'redirect' => $this->generateUrl('govwiki_admin_editrequest_index', [
                'environment' => $this->getCurrentEnvironment()->getSlug(),
            ]),
        ]);
    }

    /**
     * @Configuration\Route(
     *  "/{id}/discard",
     *  requirements={ "id": "\d+" }
     * )
     *
     * @param EditRequest $editRequest A EditRequest entity instance.
     *
     * @return JsonResponse
     */
    public function discardAction(EditRequest $editRequest)
    {
        $em = $this->getDoctrine()->getManager();
        $editRequest->setStatus('discarded');
        $em->flush();

        return new JsonResponse([
            'redirect' => $this->generateUrl('govwiki_admin_editrequest_index', [
                'environment' => $this->getCurrentEnvironment()->getSlug(),
            ]),
        ]);
    }

    /**
     * @Configuration\Route(
     * "/{id}/remove",
     *  requirements={ "id": "\d+" }
     * )
     *
     * @param EditRequest $editRequest A EditRequest entity instance.
     *
     * @return JsonResponse
     */
    public function removeAction(EditRequest $editRequest)
    {
        $em = $this->getDoctrine()->getManager();
        $em->remove($editRequest);
        $em->flush();

        return $this->redirectToRoute('govwiki_admin_editrequest_index', [
            'environment' => $this->getCurrentEnvironment()->getSlug(),
        ]);
    }
}
