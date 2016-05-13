<?php

namespace GovWiki\AdminBundle\Controller;

use GovWiki\UserBundle\Entity\User;
use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Doctrine\Common\Collections\Collection;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

/**
 * Class UserController
 * @package GovWiki\AdminBundle\Controller
 *
 * @Configuration\Route(
 *  "/{environment}/user",
 *  requirements={ "environment": "\w+" }
 * )
 */
class UserController extends AbstractGovWikiAdminController
{

    /**
     * Max user per page.
     */
    const LIMIT = 50;

    /**
     * Show list of users.
     *
     * @Configuration\Route("/", methods={"GET"})
     * @Configuration\Template
     * @Configuration\Security("is_granted('ROLE_ADMIN') or is_granted('ROLE_MANAGER')")
     *
     * @param Request $request A Request instance.
     *
     * @return array
     *
     * @throws \LogicException Some required bundle not registered.
     */
    public function indexAction(Request $request)
    {
        /** @var User $user */
        $user = $this->getUser();

        /** @var \GovWiki\UserBundle\Entity\Repository\UserRepository $repository */
        $repository = $this->getDoctrine()->getRepository('GovWikiUserBundle:User');

        $users = $repository->getListQueryForEnvironment(
            $this->getCurrentEnvironment()->getId()
        );

        if ($user->hasRole('ROLE_MANAGER') && ! $user->hasRole('ROLE_ADMIN')) {
            // Manager can see only ordinary users.
            $expr = $users->expr();

            $users
                ->andWhere($expr->orX(
                    "REGEXP('/ROLE_MANAGER/', User.roles) = 0",
                    $expr->eq('User.id', ':user')
                ))
                ->setParameter('user', $user->getId());
        }

        $users = $this->get('knp_paginator')->paginate(
            $users,
            $request->query->getInt('page', 1),
            self::LIMIT
        );

        return [ 'users' => $users ];
    }

    /**
     * Show selected user.
     *
     * @Configuration\Route("/{id}/show", requirements={"id": "\d+"})
     * @Configuration\Template
     * @Configuration\Security("is_granted('ROLE_ADMIN') or is_granted('ROLE_MANAGER')")
     *
     * @param User $user User to show.
     *
     * @return array
     */
    public function showAction(User $user)
    {
        $this->checkUserBelongsToEnvironment($user);

        return [ 'user' => $user ];
    }

    /**
     * Toggle given user enable.
     *
     * @Configuration\Route("{id}/enable", requirements={"id": "\d+"})
     *
     * @param Request $request A Request instance.
     * @param User    $user    User to enable\disable.
     *
     * @return RedirectResponse
     *
     * @throws \LogicException Some required bundle not registered.
     * @throws \InvalidArgumentException Invalid arguments.
     */
    public function enableToggleAction(Request $request, User $user)
    {
        $em = $this->getDoctrine()->getManager();

        $user->setLocked(! $user->isLocked());

        $em->persist($user);
        $em->flush();

        return new RedirectResponse($request->server->get('HTTP_REFERER'));
    }

    /**
     * Edit given user.
     *
     * @Configuration\Route(path="/{id}/edit", requirements={"id": "\d+"})
     * @Configuration\Template()
     *
     * @param Request $request A Request instance.
     * @param User    $user    Update user.
     *
     * @return array
     */
    public function editAction(Request $request, User $user)
    {
        $this->checkUserBelongsToEnvironment($user);

        $form = $this->createForm('govwiki_admin_form_user', $user);

        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            $userManager = $this->get('fos_user.user_manager');
            $userManager->updateUser($user);

            return $this->redirectToRoute('govwiki_admin_user_index', [
                'environment' => $this->getCurrentEnvironment()->getSlug(),
            ]);
        }

        return [
            'form' => $form->createView(),
            'user' => $user,
        ];
    }

    /**
     * Create new user.
     *
     * @Configuration\Route(path="/new")
     * @Configuration\Template()
     *
     * @param Request $request A Request instance.
     *
     * @return RedirectResponse|array
     */
    public function newAction(Request $request)
    {
        $environment = $this->getCurrentEnvironment();
        $userManager = $this->get('fos_user.user_manager');
        /** @var User $user */
        $user = $userManager->createUser();
        $user->addEnvironment($environment);

        $form = $this->createForm('govwiki_admin_form_user', $user);

        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            $user->setEnabled(true);
            $userManager->updateUser($user);

            return $this->redirectToRoute('govwiki_admin_user_index', [
                'environment' => $environment->getSlug(),
            ]);
        }

        return [ 'form' => $form->createView() ];
    }

    /**
     * @param User $user User
     */
    private function checkUserBelongsToEnvironment(User $user)
    {
        // If $current_user is manager of environment, do not show him admin pages and pages of users that belong to other environments
        if ($this->isGranted('ROLE_MANAGER') && !$this->isGranted('ROLE_ADMIN')) {
            /** @var User $current_user */
            /** @var Collection $environment_users_list */
            $current_user = $this->getUser();
            $environments = $current_user->getEnvironments();
            if (!$environments->isEmpty()) {
                $environment_users_list = $environments[0]->getUsers();
                if ($user->hasRole('ROLE_ADMIN') || !$environment_users_list->contains($user)) {
                    throw new AccessDeniedException();
                }
            }
        }
    }
}
