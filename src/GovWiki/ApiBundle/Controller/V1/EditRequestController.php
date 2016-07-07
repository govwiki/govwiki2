<?php

namespace GovWiki\ApiBundle\Controller\V1;

use GovWiki\ApiBundle\GovWikiApiServices;
use GovWiki\DbBundle\Entity\EditRequest;
use GovWiki\UserBundle\Entity\User;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Exception\HttpException;

/**
 * Class EditRequestController
 * @package GovWiki\ApiBundle\Controller\V1
 *
 * @Route("/edit-request")
 */
class EditRequestController extends AbstractGovWikiApiController
{
    /**
     * @Route("/create")
     *
     * @param Request $request
     * @return Response
     */
    public function createAction(Request $request)
    {
        if ($request->isXmlHttpRequest()) {
            $user = $this->getUser();

            if (($user instanceof User ) && $user->hasRole('ROLE_USER')) {
                $environment = $this->getCurrentEnvironment();

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

                $entityName = $data['entityName'];
                $entityId = $data['entityId'];

                if (($entityName === 'Government') || ($entityName === 'ElectedOfficial')) {
                    $repository = $em->getRepository('GovWikiDbBundle:EditRequest');
                    $unapproveds = $repository->getUnapprovedFor(
                        $environment->getId(),
                        $entityName,
                        $entityId
                    );

                    foreach ($unapproveds as $unapproved) {
                        if ($unapproved['user']['id'] !== $user->getId()) {
                            return new JsonResponse([
                                'errors' => [ 'Already edited.' ],
                            ], 400);
                        }
                    }
                }
                $editRequest = new EditRequest();
                $editRequest
                    ->setEnvironment($this->getCurrentEnvironment())
                    ->setUser($this->getUser())
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
