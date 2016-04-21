<?php

namespace GovWiki\AdminBundle\Controller;

use CartoDbBundle\CartoDbServices;
use Gedmo\Translator\Entity\Translation;
use GovWiki\AdminBundle\Form\Type\DelayType;
use GovWiki\AdminBundle\GovWikiAdminServices;
use GovWiki\DbBundle\Entity\Environment;
use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
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
     * @Configuration\ParamConverter(
     *  "environment",
     *  converter="environment_converter"
     * )
     *
     * @param Request     $request     A Request instance.
     * @param Environment $environment A Environment entity instance..
     *
     * @return array
     *
     * @throws AccessDeniedException User don't allow to manage current
     * environment.
     * @throws \LogicException Some required bundle not registered.
     * @throws \InvalidArgumentException Unknown entity manager.
     */
    public function showAction(Request $request, Environment $environment)
    {
        dump($this->getCurrentEnvironment());

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

        return $this->redirectToRoute('govwiki_admin_environment_show');
    }

    /**
     * @Configuration\Route("/enable")
     * @Configuration\ParamConverter(
     *  "environment",
     *  converter="environment_converter"
     * )
     *
     * @param Request     $request     A Request instance.
     * @param Environment $environment A Environment entity instance.
     *
     * @return JsonResponse|\Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function enableAction(Request $request, Environment $environment)
    {
        $em = $this->getDoctrine()->getManager();
        $environment->setEnabled(true);

        $em->persist($environment);
        $em->flush();

        if ($request->isXmlHttpRequest()) {
            return new JsonResponse();
        }

        return $this->redirectToRoute('govwiki_admin_environment_show');
    }

    /**
     * @Configuration\Route("/disable")
     * @Configuration\ParamConverter(
     *  "environment",
     *  converter="environment_converter"
     * )
     *
     * @param Request     $request     A Request instance.
     * @param Environment $environment A Environment entity instance.
     *
     * @return JsonResponse|\Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function disableAction(Request $request, Environment $environment)
    {
        $em = $this->getDoctrine()->getManager();
        $environment->setEnabled(false);

        $em->persist($environment);
        $em->flush();

        if ($request->isXmlHttpRequest()) {
            return new JsonResponse();
        }

        return $this->redirectToRoute('govwiki_admin_environment_show');
    }

    /**
     * @Configuration\Route("/template")
     * @Configuration\Template()
     * @Configuration\ParamConverter(
     *  "environment",
     *  converter="environment_converter"
     * )
     *
     * @param Request     $request     A Request instance.
     * @param Environment $environment A Environment entity instance.
     *
     * @return array
     */
    public function templateAction(Request $request, Environment $environment)
    {
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
     * @return \GovWiki\AdminBundle\Manager\Entity\AdminTranslationManager
     */
    private function getTranslationManager()
    {
        return $this->get(GovWikiAdminServices::TRANSLATION_MANAGER);
    }
}
