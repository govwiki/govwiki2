<?php

namespace GovWiki\AdminBundle\Controller;

use Doctrine\ORM\EntityRepository;
use GovWiki\AdminBundle\Form\UserForm;
use GovWiki\UserBundle\Entity\User;
use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;

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
     * @Configuration\Security("is_granted('ROLE_ADMIN')")
     *
     * @param Request $request A Request instance.
     *
     * @return array
     */
    public function indexAction(Request $request)
    {
        /** @var EntityRepository $repository */
        $repository = $this->getDoctrine()->getRepository('GovWikiUserBundle:User');

        $users = $this->get('knp_paginator')->paginate(
            $repository->createQueryBuilder('User')->orderBy('User.id'),
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
     * @Configuration\Security("is_granted('ROLE_ADMIN')")
     *
     * @param User $user User to show.
     * @Configuration\ParamConverter(
     *  name="user",
     *  class="GovWiki\UserBundle\Entity\User"
     * )
     *
     * @return void
     */
    public function showAction(User $user)
    {
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
     * @Configuration\Security("is_granted('ROLE_ADMIN')")
     *
     * @param Request $request A Request instance.
     * @param User    $user    Update user.
     * @Configuration\ParamConverter(name="user", class="GovWiki\UserBundle\Entity\User")
     *
     * @return array
     */
    public function editAction(Request $request, User $user)
    {
        $form = $this->createForm(new UserForm(false), $user);

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
     * @Configuration\Security("is_granted('ROLE_ADMIN')")
     *
     * @param Request $request A Request instance.
     *
     * @return RedirectResponse|array
     */
    public function newAction(Request $request)
    {
        $userManager = $this->get('fos_user.user_manager');
        $user = $userManager->createUser();

        $form = $this->createForm(new UserForm(), $user);

        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            $user->setEnabled(true);
            $userManager->updateUser($user);

            return $this->redirectToRoute('govwiki_admin_user_index');
        }

        return [
            'form' => $form->createView(),
            'btn_caption' => 'Add',
        ];
    }
}
