<?php

namespace GovWiki\AdminBundle\Controller;

use GovWiki\AdminBundle\Manager\AdminEnvironmentManager;
use GovWiki\ApiBundle\Exception\GovWikiApiEnvironmentNotFoundException;
use GovWiki\DbBundle\Entity\Environment;
use GovWiki\DbBundle\Form\EnvironmentType;
use GovWiki\UserBundle\Entity\User;
use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class MainController
 * @package GovWiki\AdminBundle\Controller
 */
class MainController extends AbstractGovWikiAdminController
{
    const ENVIRONMENTS_LIMIT = 25;

    /**
     * @Configuration\Route("/")
     *
     * @return array
     */
    public function indexAction()
    {
        try {
            /*
             * Try to get current environment.
             */
            $environment = $this->adminEnvironmentManager()
                ->getEnvironment();
            return $this->redirectToRoute('govwiki_admin_main_show', [
                'environment' => $environment,
            ]);
        } catch (GovWikiApiEnvironmentNotFoundException $e) {
            /*
             * Show list of available environments.
             */
            return $this->redirectToRoute('govwiki_admin_main_home');
        }
    }

    /**
     * @Configuration\Route("/list")
     * @Configuration\Template()
     *
     * @param Request $request A Request instance.
     *
     * @return array
     */
    public function homeAction(Request $request)
    {
        /** @var User $user */
        $user = $this->getUser();
        if ($user->hasRole('ROLE_ADMIN')) {
            $user = null;
        } else {
            $user = $user->getId();
        }

        $this->get('request');

        $environments = $this->paginate(
            $this->getDoctrine()
                ->getRepository('GovWikiDbBundle:Environment')
                ->getListQuery($user),
            $request->query->getInt('page', 1),
            self::ENVIRONMENTS_LIMIT
        );
        return [ 'environments' => $environments ];
    }

    /**
     * Create new environment. Show and process environment form. After success
     * processing of form redirect to map creation.
     *
     * @Configuration\Route("/new")
     * @Configuration\Template()
     * @Configuration\Security("is_granted('ROLE_ADMIN')")
     *
     * @param Request $request A Request instance.
     *
     * @return array|\Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function newAction(Request $request)
    {
        $environment = new Environment();
        $form = $this->createForm(new EnvironmentType(), $environment);
        $form->handleRequest($request);

        if ($form->isValid() && $form->isSubmitted()) {
            $em = $this->getDoctrine()->getManager();
            $em->persist($environment);
            $em->flush();

            /*
             * Forward to map controller in order to create new map.
             */
            return $this->forward('GovWikiAdminBundle:Map:new', [
                'environment' => $environment,
            ]);
        }
        return [ 'form' => $form->createView() ];
    }

    /**
     * @Configuration\Route("/{environment}")
     * @Configuration\Template()
     *
     * @param Request $request     A Request instance.
     * @param string  $environment Environment name.
     *
     * @return array
     */
    public function showAction(Request $request, $environment)
    {
        $manager = $this->adminEnvironmentManager();

        $manager->changeEnvironment($environment);
        /** @var Environment $environment */
        $environment = $manager->getEntity();

        $form = $this->createForm(new EnvironmentType(), $environment);
        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            $em = $this->getDoctrine()->getManager();
            $em->persist($environment);
            $em->flush();
        }

        return [
            'form' => $form->createView(),
            'environment' => $environment,
        ];
    }

    /**
     * @Configuration\Route("/{environment}/delete")
     *
     * @param AdminEnvironmentManager $environment A AdminEnvironmentManager
     *                                             instance.
     *
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function removeAction(AdminEnvironmentManager $environment)
    {
        $environmentObj = $environment->getReference();

        if (is_object($environmentObj)) {
            $em = $this->getDoctrine()->getManager();
            $em->remove($environmentObj);
            $em->flush();
        }

        return $this->redirectToRoute('govwiki_admin_main_home');
    }

    /**
     * @Configuration\Route("/{environment}/enable")
     *
     * @param Request                 $request     A Request instance.
     * @param AdminEnvironmentManager $environment A AdminEnvironmentManager
     *                                             instance.
     *
     * @return JsonResponse|\Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function enableAction(
        Request $request,
        AdminEnvironmentManager $environment
    ) {
        $environment->enable();

        if ($request->isXmlHttpRequest()) {
            return new JsonResponse();
        }

        return $this->redirectToRoute('govwiki_admin_main_show', [
            'environment' => $environment,
        ]);
    }

    /**
     * @Configuration\Route("/{environment}/disable")
     *
     * @param Request $request     A Request instance.
     * @param string  $environment Environment name.
     *
     * @return JsonResponse|\Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function disableAction(Request $request, $environment)
    {
        $this->toggle($environment, false);

        if ($request->isXmlHttpRequest()) {
            return new JsonResponse();
        }

        return $this->redirectToRoute('govwiki_admin_main_show', [
            'environment' => $environment,
        ]);
    }
}
