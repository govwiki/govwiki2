<?php

namespace GovWiki\AdminBundle\Controller;

use Doctrine\ORM\EntityRepository;
use GovWiki\AdminBundle\Form\UserForm;
use GovWiki\UserBundle\Entity\User;
use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Doctrine\Common\Collections\Collection;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

/**
 * Class UserController
 * @package GovWiki\AdminBundle\Controller
 *
 * @Configuration\Route("/user")
 */
class UserController extends Controller
{
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
        /** @var EntityRepository $repository */
        $repository = $this->getDoctrine()->getRepository('GovWikiUserBundle:User');

        $environment_users_list = $repository->createQueryBuilder('User')->orderBy('User.id');

        if ($this->isGranted('ROLE_MANAGER') && !$this->isGranted('ROLE_ADMIN')) {
            /** @var User $current_user */
            /** @var User $env_user */
            /** @var Collection $environment_users_list */
            $current_user = $this->getUser();
            $environments = $current_user->getEnvironments();
            if (!$environments->isEmpty()) {
                $environment_users_list = $environments[0]->getUsers();
                foreach ($environment_users_list as $key => $env_user) {
                    if ($env_user->hasRole('ROLE_ADMIN') or $env_user->hasRole('ROLE_MANAGER')) {
                        $environment_users_list->remove($key);
                    }
                }
            } else {
                $environment_users_list = array();
            }
        }

        $users = $this->get('knp_paginator')->paginate(
            $environment_users_list,
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
     * @Configuration\ParamConverter(
     *  name="user",
     *  class="GovWiki\UserBundle\Entity\User"
     * )
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
     * @Configuration\ParamConverter(name="user", class="GovWiki\UserBundle\Entity\User")
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
     * @Configuration\Template("GovWikiAdminBundle:User:manage.html.twig")
     * @Configuration\Security("is_granted('ROLE_ADMIN') or is_granted('ROLE_MANAGER')")
     *
     * @param Request $request A Request instance.
     * @param User    $user    Update user.
     * @Configuration\ParamConverter(name="user", class="GovWiki\UserBundle\Entity\User")
     *
     * @return array
     */
    public function editAction(Request $request, User $user)
    {
        $this->checkUserBelongsToEnvironment($user);

        $show_roles_and_envs_field = true;
        if ($this->isGranted('ROLE_MANAGER') && !$this->isGranted('ROLE_ADMIN')) {
            $show_roles_and_envs_field = false;
        }

        $form = $this->createForm(new UserForm(false, $show_roles_and_envs_field), $user);

        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            $userManager = $this->get('fos_user.user_manager');
            $userManager->updateUser($user);
        }

        return [
            'form' => $form->createView(),
            'btn_caption' => 'Update',
        ];
    }

    /**
     * Create new user.
     *
     * @Configuration\Route(path="/new")
     * @Configuration\Template("GovWikiAdminBundle:User:manage.html.twig")
     * @Configuration\Security("is_granted('ROLE_ADMIN') or is_granted('ROLE_MANAGER')")
     *
     * @param Request $request A Request instance.
     *
     * @return RedirectResponse|array
     */
    public function newAction(Request $request)
    {
        $userManager = $this->get('fos_user.user_manager');
        $user = $userManager->createUser();
        $current_user = $this->getUser();

        $show_roles_and_envs_field = true;
        if ($this->isGranted('ROLE_MANAGER') && !$this->isGranted('ROLE_ADMIN')) {
            $show_roles_and_envs_field = false;
        }

        $form = $this->createForm(new UserForm(null, $show_roles_and_envs_field), $user);

        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            $user->setEnabled(true);

            /** @var User $current_user */
            if ($this->isGranted('ROLE_MANAGER') && !$this->isGranted('ROLE_ADMIN')) {
                $environments = $current_user->getEnvironments();
                if (!$environments->isEmpty()) {
                    $user->addEnvironment($environments[0]);
                }
            }

            $userManager->updateUser($user);

            return $this->redirectToRoute('govwiki_admin_user_index');
        }

        return [
            'form' => $form->createView(),
            'btn_caption' => 'Add'
        ];
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
