<?php

namespace GovWiki\AdminBundle\Controller;

use CartoDbBundle\CartoDbServices;
use GovWiki\AdminBundle\GovWikiAdminServices;
use GovWiki\AdminBundle\Manager\AdminStyleManager;
use GovWiki\DbBundle\Entity\Environment;
use GovWiki\DbBundle\Form\EnvironmentType;
use GovWiki\DbBundle\GovWikiDbServices;
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
            $environment->setStyle(
                AdminStyleManager::getDefaultStyles()
            );
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
     * @Configuration\Route(
     *  "/show/{environment}",
     *  defaults={ "environment": "" }
     * )
     * @Configuration\Template()
     *
     * @param Request $request     A Request instance.
     * @param string  $environment Environment name.
     *
     * @return array
     */
    public function showAction(Request $request, $environment = '')
    {
        $manager = $this->adminEnvironmentManager();

        if ('' !== $environment) {
            $manager->changeEnvironment($environment);
        }
        /** @var Environment $entity */
        $entity = $manager->getEntity();

        $form = $this->createForm(new EnvironmentType(), $entity);
        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            $em = $this->getDoctrine()->getManager();
            $em->persist($entity);
            $manager->changeEnvironment($entity->getSlug());
            $em->flush();
        }

        return [
            'form' => $form->createView(),
            'environment' => $entity,
        ];
    }

    /**
     * @Configuration\Route("/style")
     * @Configuration\Template()
     *
     * @param Request $request A Request instance.
     *
     * @return array
     */
    public function styleAction(Request $request)
    {
        $manager = $this->get(GovWikiAdminServices::ADMIN_STYLE_MANAGER);

        $form = $manager->createForm();

        $form->handleRequest($request);
        $manager->processForm($form);

        return [ 'form' => $form->createView() ];
    }

    /**
     * @Configuration\Route("/{environment}/delete")
     *
     * @param string $environment Environment name.
     *
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function removeAction($environment)
    {
        $this->adminEnvironmentManager()->removeEnvironment($environment);
        return $this->redirectToRoute('govwiki_admin_main_home');
    }

    /**
     * @Configuration\Route("/export")
     *
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function updateAction()
    {
        $environmentManager = $this->adminEnvironmentManager();

        $environment = $environmentManager->getEnvironment();
        $filePath = $this->getParameter('kernel.logs_dir').'/'.
            $environment.'.json';

        $transformerManager = $this
            ->get(GovWikiAdminServices::TRANSFORMER_MANAGER);

        $this->get(GovWikiDbServices::GOVERNMENT_IMPORTER)
            ->export(
                $filePath,
                [ 'id', 'altTypeSlug', 'slug', 'latitude', 'longitude' ],
                $transformerManager->getTransformer('geo_json')
            );

        $this->get(CartoDbServices::CARTO_DB_API)
            ->dropDataset($environment)
            ->importDataset($filePath);

        return $this->redirectToRoute('govwiki_admin_main_show', [
            'environment' => $environment,
        ]);
    }

    /**
     * @Configuration\Route("/enable")
     *
     * @param Request $request A Request instance.
     *
     * @return JsonResponse|\Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function enableAction(Request $request)
    {
        $this->adminEnvironmentManager()->enable();

        if ($request->isXmlHttpRequest()) {
            return new JsonResponse();
        }

        return $this->redirectToRoute('govwiki_admin_main_show');
    }

    /**
     * @Configuration\Route("/disable")
     *
     * @param Request $request A Request instance.
     *
     * @return JsonResponse|\Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function disableAction(Request $request)
    {
        $this->adminEnvironmentManager()->disable();

        if ($request->isXmlHttpRequest()) {
            return new JsonResponse();
        }

        return $this->redirectToRoute('govwiki_admin_main_show');
    }
}
