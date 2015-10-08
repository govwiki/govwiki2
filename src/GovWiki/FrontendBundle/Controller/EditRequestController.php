<?php

namespace GovWiki\FrontendBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Exception\HttpException;
use GovWiki\DbBundle\Entity\EditRequest;

/**
 * EditRequestController
 */
class EditRequestController extends Controller
{
    /**
     * @Route("new")
     *
     * Just checking access rights
     *
     * @return Response
     */
    public function newAction()
    {
        if ($this->getUser() and $this->getUser()->hasRole('ROLE_USER')) {
            return new Response(null, 200);
        } else {
            return new Response(null, 401);
        }
    }

    /**
     * @Route("create")
     *
     * @param Request $request
     * @return Response
     */
    public function createAction(Request $request)
    {
        if ($request->isXmlHttpRequest()) {
            if ($this->getUser() and $this->getUser()->hasRole('ROLE_USER')) {
                $errors = [];

                $data = json_decode($request->request->get('editRequest'), true);

                if (empty($data['entityName'])) {
                    $errors[] = 'Empty entity name';
                }
                if (empty($data['entityId'])) {
                    $errors[] = 'Empty id';
                }
                if (empty($data['changes'])) {
                    $errors[] = 'No changes';
                }

                if (!empty($errors)) {
                    return new JsonResponse(['errors' => $errors], 400);
                }

                $em = $this->getDoctrine()->getManager();

                $editRequest = new EditRequest;
                $editRequest->setUser($this->getUser())
                            ->setEntityName($data['entityName'])
                            ->setEntityId($data['entityId'])
                            ->setChanges($data['changes']);
                $em->persist($editRequest);
                $em->flush();

                return new JsonResponse(['message' => 'We save your edit request. Thank you!'], 200);
            } else {
                return new Response(null, 401);
            }
        } else {
            throw new HttpException(400);
        }
    }
}
