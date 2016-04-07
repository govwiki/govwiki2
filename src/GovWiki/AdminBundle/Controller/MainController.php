<?php

namespace GovWiki\AdminBundle\Controller;

use CartoDbBundle\CartoDbServices;
use GovWiki\AdminBundle\GovWikiAdminServices;
use GovWiki\DbBundle\Entity\Environment;
use GovWiki\DbBundle\Form\EnvironmentType;
use GovWiki\UserBundle\Entity\User;
use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use GovWiki\DbBundle\Entity\Translation;

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
     *
     * @throws \LogicException Some required bundle not registered.
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
     *
     * @throws AccessDeniedException User don't allow to manage current
     * environment.
     * @throws \LogicException Some required bundle not registered.
     * @throws \InvalidArgumentException Unknown entity manager.
     */
    public function showAction(Request $request, $environment = '')
    {
        $manager = $this->adminEnvironmentManager();

        if ('' !== $environment) {
            $manager->changeEnvironment($environment);
        }
        /** @var Environment $entity */
        $entity = $manager->getEntity();

        $locale = $entity->getLocales()[0];
        $trans_key_settings = [
            'matching' => 'eq',
            'transKeys' => ['map.greeting_text', 'general.bottom_text'],
        ];
        /** @var Translation $translation */
        $translations = $this->getTranslationManager()->getTranslationsBySettings($locale->getShortName(), $trans_key_settings);
        $greetingText = '';
        $bottomText = '';
        foreach ($translations as $translation) {
            switch ($translation->getTransKey()) {
                case 'map.greeting_text':
                    $greetingText = $translation->getTranslation();
                    break;
                case 'general.bottom_text':
                    $bottomText = $translation->getTranslation();
                    break;
            }
        }

        $form = $this->createForm(new EnvironmentType(), $entity);
        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            $em = $this->getDoctrine()->getManager();
            $manager->changeEnvironment($entity->getSlug());

            if (count($entity->getLocales()) == 1) {
                $greetingText = $request->request->get('greetingText');
                $bottomText = $request->request->get('bottomText');
                $texts = [
                    'map.greeting_text' => $greetingText,
                    'general.bottom_text' => $bottomText,
                ];

                foreach ($translations as $translation) {
                    $translation->setTranslation($texts[$translation->getTransKey()]);
                }
            }

            // Change logo url.
            $file = $entity->getFile();
            if ($file) {
                /*
                 * Move uploaded file to upload directory.
                 */
                $filename = $entity->getSlug() . '.' .
                    $file->getClientOriginalExtension();

                $file->move(
                    $this->getParameter('kernel.root_dir') .'/../web/img/upload',
                    $filename
                );

                $entity->setLogo('/img/upload/' . $filename);
            }

            $em->persist($entity);
            $em->flush();
        }

        return [
            'form' => $form->createView(),
            'environment' => $entity,
            'greetingText' => $greetingText,
            'bottomText' => $bottomText,
        ];
    }

    /**
     * @Configuration\Route("/sitemap")
     *
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function sitemapAction()
    {
        $environment = $this->adminEnvironmentManager()->getSlug();
        $this->get(GovWikiAdminServices::TXT_SITEMAP_GENERATOR)
            ->generate($environment);

        return $this->redirectToRoute('govwiki_admin_main_show', [
            'environment' => $environment,
        ]);
    }

    /**
     * @Configuration\Route("/{environment}/delete")
     *
     * @param string $environment Environment name.
     *
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     *
     * @throws AccessDeniedException User don't allow to manage current
     * environment.
     * @throws \Doctrine\DBAL\DBALException Can't delete government related
     *                                      table.
     */
    public function removeAction($environment)
    {
        $this->adminEnvironmentManager()->removeEnvironment($environment);

        $api = $this->get(CartoDbServices::CARTO_DB_API);

        $api->sqlRequest("DROP TABLE {$environment}");
        $api->deleteMap($environment);

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
        $map = $this->adminEnvironmentManager()->getMap();
        $environmentManager->updateCartoDB(
            $map->getColorizedCountyConditions()->getFieldName()
        );

        return $this->redirectToRoute('govwiki_admin_main_show', [
            'environment' => $environmentManager->getEnvironment(),
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

    /**
     * Save images
     *
     * @Configuration\Route("/load-favicon")
     * @param Request $request
     *
     * @return Response
     */
    public function faviconLoadAction(Request $request)
    {
        if ($request->isXmlHttpRequest()) {
            $user = $this->getUser();
            if ($user->hasRole('ROLE_ADMIN') || $user->hasRole('ROLE_MANAGER')) {

                // validate extension
                $extensionValues = [
                    'ico',
                ];

                // get environment name
                $folderName = $request->request->get('environment');

                // favicon dir
                $dir = $this->get('kernel')->getRootDir().'/../web/img/'.$folderName;

                $image = $request->files->get('upload-favicon');
                $fileName = $image->getClientOriginalName();
                $extension = explode('.', $fileName);
                $extension = array_pop($extension);
                //$size = $image->getClientSize()/1000; // KB

                // validate by extension
                if (in_array($extension, $extensionValues)) {
                    if (!file_exists($dir)) {
                        mkdir($dir);
                    }

                    $image->move($dir, 'favicon.ico');

                    return new JsonResponse(
                        [
                            'message' => 'Favicon upload success!',
                            'error' => false,
                        ]
                    );
                }

                return new JsonResponse(
                    [
                        'message' => 'Broken favicon extension! Favicon not loaded',
                        'error' => true,
                    ]
                );
            }
        }

        throw $this->createNotFoundException();
    }

    /**
     * Load logo
     *
     * @Configuration\Route("/load-logo")
     * @param Request $request
     *
     * @return Response
     */
    public function loadImageAction(Request $request)
    {
        if ($request->isXmlHttpRequest()) {
            $environment = $request->request->get('environment');
            $image       = $request->files->get('upload-image');
            $id          = $request->request->get('id');

            if ($environment) {
                // get environment name
                $folderName = $request->request->get('environment');

                // favicon dir
                $dir = $this->get('kernel')->getRootDir().'/../web/img/'.$folderName;
                if (!file_exists($dir)) {
                    mkdir($dir);
                }

                $fileName = $image->getClientOriginalName();
                $extension = explode('.', $fileName);
                $extension = array_pop($extension);

                $em = $this->getDoctrine()->getManager();
                $content = $em->getRepository("GovWikiDbBundle:EnvironmentContents")->find($id);
                $image->move($dir, $content->getSlug().'.'.$extension);
                $content->setValue('/img/'.$folderName.'/'.$content->getSlug().'.'.$extension);
                $em->flush();
            }

            return new JsonResponse(['status' => 'Image success upload']);
        }

        throw $this->createNotFoundException();
    }

    /**
     * @return \GovWiki\AdminBundle\Manager\Entity\AdminTranslationManager
     */
    private function getTranslationManager()
    {
        return $this->get(GovWikiAdminServices::TRANSLATION_MANAGER);
    }
}
