<?php

namespace GovWiki\ApiBundle\Controller\V1;

use GovWiki\DbBundle\GovWikiDbServices;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Exception\HttpException;

/**
 * Class CreateRequestController
 * @package GovWiki\ApiBundle\Controller\V1
 *
 * @Route("/create-request")
 */
class CreateRequestController extends AbstractGovWikiApiController
{

    /**
     * @Route("/create")
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

                $environment = $this->getCurrentEnvironment();

                $entity = $this
                    ->get(GovWikiDbServices::CREATE_REQUEST_MANAGER)
                    ->process(
                        $data,
                        $environment
                    );

                $em = $this->getDoctrine()->getManager();
                $em->persist($entity);
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
