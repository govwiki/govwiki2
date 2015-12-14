<?php

namespace GovWiki\ApiBundle\Controller\V1;

use GovWiki\UserBundle\Entity\User;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;

/**
 * Class UserController
 * @package GovWiki\ApiBundle\Controller
 *
 * @Route("/user")
 */
class UserController extends Controller
{
    /**
     * Get information about current user.
     *
     * @Route(path="/", methods={"GET"})
     *
     * @return JsonResponse
     */
    public function getAction()
    {
        /** @var User $user */
        $user = $this->getUser();

        if (null === $user) {
            return new JsonResponse([], 401);
        }

        return new JsonResponse([
            'data' => [
                'username' => $user->getUsername(),
                'roles' => $user->getRoles(),
            ],
            'status' => 'ok',
        ]);
    }
}
