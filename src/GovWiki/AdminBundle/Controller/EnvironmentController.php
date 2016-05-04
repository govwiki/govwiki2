<?php

namespace GovWiki\AdminBundle\Controller;

use CartoDbBundle\CartoDbServices;
use CartoDbBundle\Service\CartoDbApi;
use Gedmo\Translator\Entity\Translation;
use GovWiki\AdminBundle\Form\Type\DelayType;
use GovWiki\AdminBundle\GovWikiAdminServices;
use GovWiki\DbBundle\Doctrine\Type\ColoringConditions\ColoringConditions;
use GovWiki\DbBundle\Entity\Map;
use GovWiki\DbBundle\File\CsvReader;
use GovWiki\DbBundle\Form\MapType;
use GovWiki\DbBundle\GovWikiDbServices;
use GovWiki\EnvironmentBundle\Strategy\GovwikiNamingStrategy;
use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

/**
 * Class EnvironmentController
 * @package GovWiki\AdminBundle\Controller
 *
 * @Configuration\Route("/{environment}", requirements={ "environment": "\w+" })
 */
class EnvironmentController extends AbstractGovWikiAdminController
{
    /**
     * @Configuration\Route()
     * @Configuration\Template()
     *
     * @param Request $request A Request instance.
     *
     * @return array
     *
     * @throws AccessDeniedException User don't allow to manage current
     * environment.
     * @throws \LogicException Some required bundle not registered.
     * @throws \InvalidArgumentException Unknown entity manager.
     */
    public function showAction(Request $request)
    {
        $environment = $this->getCurrentEnvironment();

        $locale = $environment->getLocales()[0];
        $trans_key_settings = [
            'matching' => 'eq',
            'transKeys' => ['map.greeting_text', 'general.bottom_text'],
        ];
        /** @var Translation $translation */
        $translations = $this->getTranslationManager()
            ->getEnvironmentTranslations($locale->getShortName(), $trans_key_settings);
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
     * @Configuration\Route("/delete")
     *
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     *
     * @throws AccessDeniedException User don't allow to manage current
     * environment.
     * @throws \Doctrine\DBAL\DBALException Can't delete government related
     *                                      table.
     */
    public function removeAction()
    {
        $environment = $this->getCurrentEnvironment();

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
            $this->errorMessage("Can't remove environment: ". $e->getMessage());
            $con->rollBack();
        } finally {
            $con->exec('SET foreign_key_checks = 1');
        }

        $this->setCurrentEnvironment(null);

        return $this->redirectToRoute('govwiki_admin_main_home');
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
        $environment = $this->getCurrentEnvironment();

        $em = $this->getDoctrine()->getManager();
        $environment->setEnabled(true);

        $em->persist($environment);
        $em->flush();

        if ($request->isXmlHttpRequest()) {
            return new JsonResponse();
        }

        return $this->redirectToRoute('govwiki_admin_environment_show', [
            'environment' => $environment->getSlug(),
        ]);
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
        $environment = $this->getCurrentEnvironment();

        $em = $this->getDoctrine()->getManager();
        $environment->setEnabled(false);

        $em->persist($environment);
        $em->flush();

        if ($request->isXmlHttpRequest()) {
            return new JsonResponse();
        }

        return $this->redirectToRoute('govwiki_admin_environment_show', [
            'environment' => $environment->getSlug(),
        ]);
    }

    /**
     * @Configuration\Route("/template")
     * @Configuration\Template()
     *
     * @param Request $request A Request instance.
     *
     * @return array
     */
    public function templateAction(Request $request)
    {
        $environment = $this->getCurrentEnvironment();

        $template = $this->getDoctrine()
            ->getRepository('GovWikiAdminBundle:Template')
            ->getVoteEmailTemplate($this->getCurrentEnvironment()->getSlug());

        $form = $this->createFormBuilder([
            'template' => $template->getContent(),
            'delay' => $environment->getLegislationDisplayTime(),
        ])
            ->add('template', 'ckeditor', [
                'config' => [ 'entities' => false ],
            ])
            ->add('delay', new DelayType())
            ->getForm();

        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $em = $this->getDoctrine()->getManager();
            $data = $form->getData();
            $data['delay'] = array_map(
                function ($element) { return (int) $element; },
                $data['delay']
            );

            $template->setContent($data['template']);
            $environment->setLegislationDisplayTime($data['delay']);

            $em->persist($template);
            $em->persist($environment);
            $em->flush();
        }

        return [ 'form' => $form->createView() ];
    }

    /**
     * @Configuration\Route("/map")
     * @Configuration\Template()
     *
     * @param Request $request A Request instance.
     *
     * @return array
     *
     * @throws NotFoundHttpException Can't find map for given environment.
     * @throws \LogicException If DoctrineBundle is not available.
     * @throws \InvalidArgumentException Unknown manager.
     */
    public function mapAction(Request $request)
    {
        $environment = $this->getCurrentEnvironment();

        /** @var Map $map */
        $map = $this->getCurrentEnvironment()->getMap();
        if (null === $map) {
            throw new NotFoundHttpException();
        }

        $form = $this->createForm(new MapType(), $map);

        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            $em = $this->getDoctrine()->getManager();

            // Get all coloring conditions.
            $data = $request->request->get('ccc');

            if (array_key_exists('colorized', $data)) {
                // Add coloring conditions for given map.
                $data['colorized'] = true;
                $conditions = ColoringConditions::fromArray($data);

                // Get values for field from coloring conditions.
                $values = $this->getGovernmentManager()
                    ->getConditionValues($environment, $conditions->getFieldName());

                // Prepare sql parts for CartoDB sql request.
                $sqlParts = [];
                foreach ($values as $row) {
                    $slug = CartoDbApi::escapeString($row['slug']);
                    $altTypeSlug = CartoDbApi::escapeString($row['alt_type_slug']);
                    $data = $row['data'];
                    $data = ($data === null) ? 'null' : $data;

                    $sqlParts[] = "
                        ('{$slug}', '{$altTypeSlug}', '{$data}')
                    ";
                }

                $dataset = GovwikiNamingStrategy::cartoDbDatasetName($environment);
                $api = $this->get(CartoDbServices::CARTO_DB_API);
                $api
                    // Create temporary dataset.
                    ->createDataset($dataset .'_temporary', [
                        'alt_type_slug' => 'VARCHAR(255)',
                        'slug' => 'VARCHAR(255)',
                        'data_json' => 'VARCHAR(255)',
                    ], true)
                    ->sqlRequest("
                        INSERT INTO {$dataset}_temporary
                            (slug, alt_type_slug, data_json)
                        VALUES ". implode(',', $sqlParts));
                // Update concrete environment dataset from temporary
                // dataset.
                $api->sqlRequest("
                    UPDATE {$dataset} e
                    SET data_json = t.data_json
                    FROM {$dataset}_temporary t
                    WHERE e.slug = t.slug AND
                        e.alt_type_slug = t.alt_type_slug
                ");
                // Remove temporary dataset.
                $api->dropDataset($dataset .'_temporary');
            } else {
                $data['colorized'] = false;
                $conditions = ColoringConditions::fromArray($data);
            }

            $map->setColoringConditions($conditions);
            $em->persist($map);
            $em->flush();
        }

        return [
            'form' => $form->createView(),
            'conditions' => $map->getColoringConditions(),
            'fields' => $this->getFormatManager()
                ->getGovernmentFields($environment),
        ];
    }

    /**
     * @Configuration\Route("/format")
     * @Configuration\Template()
     *
     * @return array
     */
    public function formatAction()
    {
        // Get all available tabs.
        $tabs = $this->getDoctrine()->getRepository('GovWikiDbBundle:Tab')
            ->get($this->getCurrentEnvironment());

        return [ 'tabs' => $tabs ];
    }

    /**
     * @Configuration\Route("/fin_data/")
     * @Configuration\Template()
     *
     * @param Request $request A Request instance.
     *
     * @return array
     */
    public function finAction(Request $request)
    {
        $form = $this->createFormBuilder(null, [
            'action' => $this->generateUrl(
                'govwiki_admin_environment_fin',
                [ 'environment' => $this->getCurrentEnvironment()->getSlug() ]
            ),
        ])
            ->add('csv_file', 'file')
            ->getForm();

        $form->handleRequest($request);
        if ($form->isSubmitted()) {
            if ($form->isValid()) {
                /** @var UploadedFile $file */
                $file = $form->getData()['csv_file'];

                $filePath = $file->getPathname();

                try {
                    $this->get(GovWikiDbServices::FIN_DATA_IMPORTER)
                        ->import(new CsvReader($filePath));
                } catch (\Exception $e) {
                    $this->errorMessage('Can\'t import new financial statements');

                    return $this->redirectToRoute(
                        'govwiki_admin_environment_show',
                        [ 'environment' => $this->getCurrentEnvironment()->getSlug() ]
                    );
                }

                $this->successMessage('Financial statements imported successfully');

                return $this->redirectToRoute(
                    'govwiki_admin_environment_show',
                    [ 'environment' => $this->getCurrentEnvironment()->getSlug() ]
                );
            }

            $this->errorMessage('Can\'t import new financial statements');
        }

        return [ 'form' => $form->createView() ];
    }

    /**
     * @return \GovWiki\AdminBundle\Manager\Entity\AdminTranslationManager
     */
    private function getTranslationManager()
    {
        return $this->get(GovWikiAdminServices::TRANSLATION_MANAGER);
    }
}
