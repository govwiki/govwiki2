<?php

namespace GovWiki\AdminBundle\Controller;

use CartoDbBundle\CartoDbServices;
use GovWiki\AdminBundle\GovWikiAdminServices;
use GovWiki\DbBundle\Entity\Environment;
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
     *  "/show/{slug}",
     *  defaults={ "slug": "" }
     * )
     * @Configuration\Template()
     *
     * @param Request $request A Request instance.
     * @param string  $slug    Environment name.
     *
     * @return array
     *
     * @throws AccessDeniedException User don't allow to manage current
     * environment.
     * @throws \LogicException Some required bundle not registered.
     * @throws \InvalidArgumentException Unknown entity manager.
     */
    public function showAction(Request $request, $slug = '')
    {
        $environment = $this->getCurrentEnvironment();
        if ($slug !== '') {
            $environment = $this->getDoctrine()
                ->getRepository('GovWikiDbBundle:Environment')
                ->getBySlug($slug);
            $this->setCurrentEnvironment($environment);
        }

        $locale = $environment->getLocales()[0];
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

        $form = $this->createForm('environment', $environment);
        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            $em = $this->getDoctrine()->getManager();
            $environment = $this->getDoctrine()
                ->getRepository('GovWikiDbBundle:Environment')
                ->getBySlug($slug);
            $this->setCurrentEnvironment($environment);

            if (count($environment->getLocales()) == 1) {
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
            $file = $environment->getFile();
            if ($file) {
                /*
                 * Move uploaded file to upload directory.
                 */
                $filename = $environment->getSlug() . '.' .
                    $file->getClientOriginalExtension();

                $file->move(
                    $this->getParameter('kernel.root_dir') .'/../web/img/upload',
                    $filename
                );

                $environment->setLogo('/img/upload/' . $filename);
            }

            $em->persist($environment);
            $em->flush();
        }

        return [
            'form' => $form->createView(),
            'environment' => $environment,
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
        $environment = $this->getCurrentEnvironment()->getSlug();
        $this->get(GovWikiAdminServices::TXT_SITEMAP_GENERATOR)
            ->generate($environment);

        return $this->redirectToRoute('govwiki_admin_main_show', [
            'environment' => $environment,
        ]);
    }

    /**
     * @Configuration\Route(
     *  "/{environment}/delete",
     *  requirements={ "environment": "\w+" }
     * )
     * @Configuration\ParamConverter(
     *  "environment",
     *  converter="environment_converter"
     * )
     *
     * @param Environment $environment A Environment entity instance.
     *
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     *
     * @throws AccessDeniedException User don't allow to manage current
     * environment.
     * @throws \Doctrine\DBAL\DBALException Can't delete government related
     *                                      table.
     */
    public function removeAction(Environment $environment)
    {
        // Delete environment related tables.
        $this->getGovernmentManager()->removeTable($environment);
        $this->getMaxRankManager()->removeTable($environment);

        // Remove dataset from CartoDB.
        $this->get(CartoDbServices::CARTO_DB_API)
            ->sqlRequest("DROP TABLE {$environment}");

        // Remove all environment data.
        // Doctrine QueryBuilder don't allow to use join in remove query :-(
        // use native query.
        $con = $this->getDoctrine()->getConnection();

        $con->beginTransaction();
        try {
            $con->exec('SET foreign_key_checks = 0');
            $con->exec("
                DELETE c FROM `comments` c
                LEFT JOIN `elected_officials_votes` v ON v.id = c.subject_id
                LEFT JOIN `elected_officials` eo ON eo.id = v.elected_official_id
                LEFT JOIN `governments` g ON eo.government_id = g.id
                WHERE
                    g.environment_id = {$environment->getId()} AND
                    c.type = 'vote'
            ");

            $con->exec("
                DELETE v FROM elected_officials_votes v
                LEFT JOIN elected_officials eo ON v.elected_official_id = eo.id
                LEFT JOIN governments g ON eo.government_id = g.id
                WHERE
                    g.environment_id = {$environment->getId()}
            ");

            $con->exec("
                DELETE l FROM legislations l
                LEFT JOIN governments g ON l.government_id = g.id
                WHERE
                    g.environment_id = {$environment->getId()}
            ");

            $con->exec("
                DELETE c FROM contributions c
                LEFT JOIN elected_officials eo ON c.elected_official_id = eo.id
                LEFT JOIN governments g ON eo.government_id = g.id
                WHERE
                    g.environment_id = {$environment->getId()}
            ");

            $con->exec("
                DELETE e FROM endorsements e
                LEFT JOIN elected_officials eo ON e.elected_official_id = eo.id
                LEFT JOIN governments g ON eo.government_id = g.id
                WHERE
                    g.environment_id = {$environment->getId()}
            ");

            $con->exec("
                DELETE ps FROM public_statements ps
                LEFT JOIN elected_officials eo ON ps.elected_official_id = eo.id
                LEFT JOIN governments g ON eo.government_id = g.id
                WHERE
                    g.environment_id = {$environment->getId()}
            ");

            $con->exec("
                DELETE eo FROM elected_officials eo
                LEFT JOIN governments g ON eo.government_id = g.id
                WHERE
                    g.environment_id = {$environment->getId()}
            ");

            $con->exec("
                DELETE f FROM findata f
                LEFT JOIN governments g ON f.government_id = g.id
                WHERE
                    g.environment_id = {$environment->getId()}
            ");

            $con->exec("
                DELETE FROM governments
                WHERE
                    environment_id = {$environment->getId()}
            ");

            $con->exec("
                DELETE FROM formats
                WHERE
                    environment_id = {$environment->getId()}
            ");

            $con->exec("
                DELETE FROM groups
                WHERE
                    environment_id = {$environment->getId()}
            ");

            $con->exec("
                DELETE t FROM translations t
                JOIN locales l ON t.locale_id = l.id
                WHERE
                    l.environment_id = {$environment->getId()}
            ");

            $con->exec("
                DELETE FROM locales
                WHERE
                    environment_id = {$environment->getId()}
            ");

            $con->exec("
                DELETE e, m FROM environments e
                JOIN maps m ON m.id = e.map_id
                WHERE
                    e.id = {$environment->getId()}
            ");

            $con->commit();
            $this->successMessage('Environment removed.');
        } catch (\Exception $e) {
            $this->errorMessage("Can't remove environemnt: ". $e->getMessage());
            $con->rollBack();
        } finally {
            $con->exec('SET foreign_key_checks = 1');
        }

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
        $map = $this->getCurrentEnvironment()->getMap();
        $environmentManager->updateCartoDB(
            $map->getColoringConditions()->getFieldName()
        );

        return $this->redirectToRoute('govwiki_admin_main_show', [
            'environment' => $this->getCurrentEnvironment()->getSlug(),
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
        $em = $this->getDoctrine()->getManager();

        $entity = $this->getCurrentEnvironment();
        $entity->setEnabled(true);

        $em->persist($entity);
        $em->flush();

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
        $em = $this->getDoctrine()->getManager();

        $entity = $this->getCurrentEnvironment();
        $entity->setEnabled(false);

        $em->persist($entity);
        $em->flush();

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
