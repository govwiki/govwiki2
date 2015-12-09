<?php

namespace GovWiki\AdminBundle\Controller;

use Doctrine\ORM\EntityRepository;
use GovWiki\AdminBundle\Form\UserForm;
use GovWiki\UserBundle\Entity\User;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class UserController
 * @package GovWiki\AdminBundle\Controller
 */
class UserController extends Controller
{
    const LIMIT = 50;

    /**
     * Show list of users.
     *
     * @Route(path="/", methods={"GET"})
     * @Template
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
     * @Route(path="{id}/show", requirements={"id": "\d+"})
     * @Template
     *
     * @param User $user User to show.
     * @ParamConverter(name="user", class="GovWiki\UserBundle\Entity\User")
     *
     * @return void
     */
    public function showAction(User $user)
    {
    }

    /**
     * @Route(path="{id}/enable")
     *
     * @param Request $request A Request instance.
     * @param User    $user    User to enable\disable.
     * @ParamConverter(name="user", class="GovWiki\UserBundle\Entity\User")
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
     * @Route(path="/{id}/edit")
     * @Template(template="GovWikiAdminBundle:User:manage.html.twig")
     *
     * @param Request $request A Request instance.
     * @param User    $user    Update user.
     * @ParamConverter(name="user", class="GovWiki\UserBundle\Entity\User")
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
     * @Route(path="/new")
     * @Template(template="GovWikiAdminBundle:User:manage.html.twig")
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
