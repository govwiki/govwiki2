<?php

namespace GovWiki\AdminBundle\Controller;

use GovWiki\AdminBundle\Form\TranslationForm;
use GovWiki\DbBundle\Entity\GlobalLocale;
use GovWiki\DbBundle\Entity\Locale;
use GovWiki\AdminBundle\GovWikiAdminServices;
use GovWiki\DbBundle\Entity\Repository\LocaleRepository;
use Symfony\Component\Finder\Finder;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use GovWiki\DbBundle\Entity\Translation;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\Filesystem\Filesystem;

/**
 * Class LocalizationController
 * @package GovWiki\AdminBundle\Controller
 *
 * @Configuration\Route(
 *  "/{environment}/localization",
 *  requirements={ "environment": "\w+" }
 * )
 */
class LocalizationController extends AbstractGovWikiAdminController
{

    /**
     * Show list of localizations.
     *
     * @Configuration\Route("/", methods="GET")
     * @Configuration\Template()
     *
     * @return array
     *
     * @throws \LogicException Some required bundle not registered.
     */
    public function indexAction(Request $request)
    {
        if ($this->getCurrentEnvironment() === null) {
            return $this->redirectToRoute('govwiki_admin_main_home');
        }

        $locale_names_list = $this->getLocaleManager()->getListLocaleNames();

        $locale_names_pagination = $this->get('knp_paginator')->paginate(
            $locale_names_list,
            $request->query->getInt('page', 1),
            20
        );

        return [ 'locale_names_list' => $locale_names_pagination ];
    }

    /**
     * @Configuration\Route("/{locale_name}/show")
     * @Configuration\Template()
     *
     * @param Request $request     A Request instance.
     * @param string  $locale_name Locale name.
     *
     * @return array
     *
     * @throws AccessDeniedException User don't allow to manage current
     * environment.
     * @throws \LogicException Some required bundle not registered.
     * @throws \InvalidArgumentException Unknown entity manager.
     */
    public function showLocaleAction(Request $request, $locale_name)
    {
        if ($this->getCurrentEnvironment() === null) {
            return $this->redirectToRoute('govwiki_admin_main_home');
        }

        $filter_trans_key = null;
        $filter_translation = null;
        if ($filter = $request->query->get('filter')) {
            if (!empty($filter['trans_key'])) {
                $filter_trans_key = $filter['trans_key'];
            }
            if (!empty($filter['translation'])) {
                $filter_translation = $filter['translation'];
            }
        }

        $trans_key_settings = [];
        if (!empty($filter_trans_key)) {
            $trans_key_settings = array_merge($trans_key_settings, [
                'matching' => 'like',
                'transKeys' => [$filter_trans_key]
            ]);
        }
        $trans_list = $this->getTranslationManager()
            ->getEnvironmentTranslations($locale_name, $trans_key_settings, $filter_translation);

        $without_transText = [];
        /** @var Translation $translation */
        foreach ($trans_list as $key => $translation) {
            if ($translation->getTransKey() == $translation->getTranslation() || $translation->getTranslation() == '') {
                $without_transText[] = $translation;
                unset($trans_list[$key]);
            }
        }

        $with_transText_pagination = $this->get('knp_paginator')->paginate(
            $trans_list,
            $request->query->getInt('with_translation_page', 1),
            50,
            ['pageParameterName' => 'with_translation_page']
        );
        $without_transText_pagination = $this->get('knp_paginator')->paginate(
            $without_transText,
            $request->query->getInt('without_translation_page', 1),
            50,
            ['pageParameterName' => 'without_translation_page']
        );

        return [
            'with_transText' => $with_transText_pagination,
            'count_with_transText' => count($trans_list),
            'without_transText' => $without_transText_pagination,
            'count_without_transText' => count($without_transText),
            'locale_name' => $locale_name
        ];
    }

    /**
     * @Configuration\Route("/create")
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
    public function createLocaleAction(Request $request)
    {
        $environment = $this->getCurrentEnvironment();

        if ($environment === null) {
            return $this->redirectToRoute('govwiki_admin_main_home');
        }

        $em = $this->getDoctrine()->getManager();

        $trans_info_list_en = $this->getTranslationManager()->getTransInfoByLocale('en');

        $language_list = [
            'en' => 'English',
            'es' => 'Spanish',
            'fr' => 'French',
            'de' => 'German',
            'it' => 'Italian',
        ];

        /** @var LocaleRepository $localeRepository */
        $localeRepository = $em->getRepository('GovWikiDbBundle:AbstractLocale');
        $language_list = $localeRepository
            ->checkAvailableLocales($environment->getId(), $language_list);

        $form = $this->createFormBuilder()
            ->add('locale_name', 'choice', [
                'choices' => $language_list
            ])
            ->getForm();

        $form->handleRequest($request);
        if ($form->isValid()) {
            $locale_name = $form->getData()['locale_name'];

            $locale = $this->getLocaleManager()->getOneLocaleByShortName($locale_name);

            if (!$locale) {
                $global_locale = $this->getLocaleManager()
                    ->getOneLocaleByShortName($locale_name, true);

                $new_locale = new Locale();
                $new_locale->setShortName($locale_name);
                $new_locale->setEnvironment($environment);
                $em->persist($new_locale);

                foreach ($trans_info_list_en as $trans_info) {
                    $translation = new Translation();
                    $translation->setLocale($new_locale);
                    $translation->setTransKey($trans_info['transKey']);
                    $translation->setTranslation($trans_info['translation']);
                    $translation->setTransTextareaType($trans_info['transTextareaType']);
                    $em->persist($translation);
                }

                if (! $global_locale) {
                    $global_trans_info_list_en = $this->getTranslationManager()
                        ->getTransInfoByLocale('en', true);

                    $new_global_locale = new GlobalLocale();
                    $new_global_locale->setShortName($locale_name);
                    $em->persist($new_global_locale);

                    foreach ($global_trans_info_list_en as $trans_info) {
                        $translation = new Translation();
                        $translation->setLocale($new_global_locale);
                        $translation->setTransKey($trans_info['transKey']);
                        $translation->setTranslation($trans_info['translation']);
                        $translation->setTransTextareaType($trans_info['transTextareaType']);
                        $em->persist($translation);
                    }
                }

                $em->flush();
                $this->clearTranslationsCache();

                return $this->redirectToRoute('govwiki_admin_localization_index', [
                    'environment' => $environment->getSlug(),
                ]);
            } else {
                $this->addFlash('error', 'Locale ' . strtoupper($locale->getShortName()) . ' exists.');
            }
        }

        return [
            'form' => $form->createView()
        ];
    }

    /**
     * @Configuration\Route("/{locale_name}/remove")
     *
     * @param string $locale_name Localization locale.
     *
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     *
     * @throws AccessDeniedException User don't allow to manage current
     * localization.
     */
    public function removeLocaleAction($locale_name)
    {
        if ($this->getCurrentEnvironment() === null) {
            return $this->redirectToRoute('govwiki_admin_main_home');
        }

        $em = $this->getDoctrine()->getManager();

        $locale = $this->getLocaleManager()->getOneLocaleByShortName($locale_name);
        $em->remove($locale);
        $em->flush();
        $this->clearTranslationsCache();

        return $this->redirectToRoute('govwiki_admin_localization_index', [
            'environment' => $this->getCurrentEnvironment()->getSlug()
        ]);
    }

    /**
     * @Configuration\Route("/{locale_name}/export")
     *
     * @param string $locale_name Locale shortName
     *
     * @return array|BinaryFileResponse
     */
    public function exportLocaleAction($locale_name)
    {
        if ($this->getCurrentEnvironment() === null) {
            return $this->redirectToRoute('govwiki_admin_main_home');
        }

        $env_name = $this->getCurrentEnvironment()->getSlug();
        if (null === $env_name) {
            $env_name = 'global';
        }
        $filePath = $this->getParameter('kernel.logs_dir') . '/' . $env_name . '.locale.' . $locale_name . '.yml';

        $data = $this->getTranslationManager()->getTransInfoByLocale($locale_name);

        $fp = fopen($filePath, 'w');
        foreach ($data as $row) {
            $row_translation = $row['translation'];
            if ($row_translation != strip_tags($row_translation)) {
                $row_translation = preg_replace('/\r\n|\r|\n/', '', $row_translation);
            }
            fwrite($fp, $row['transKey'] . ": '" . $row_translation . "'\n");
        }
        fclose($fp);

        $response = new Response(file_get_contents($filePath));
        $response->headers->set('Cache-Control', 'public');
        $response->headers->set(
            'Content-Disposition',
            'attachment; filename=' . $env_name . '.locale.' . $locale_name . '.yml'
        );

        unlink($filePath);
        return $response;
    }

    /**
     * @Configuration\Route("/{locale_name}/import")
     * @Configuration\Template()
     *
     * @param Request $request A Request instance.
     * @param string $locale_name Locale shortName
     *
     * @return array|BinaryFileResponse
     */
    public function importLocaleAction(Request $request, $locale_name)
    {
        if ($this->getCurrentEnvironment() === null) {
            return $this->redirectToRoute('govwiki_admin_main_home');
        }

        $em = $this->getDoctrine()->getManager();
        /*
         * Build form.
         */
        $form = $this->createFormBuilder()
            ->add('file', 'file', [
                'label' => 'YAML file'
            ])
            ->getForm();

        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            /** @var UploadedFile $file */
            $file = $form->getData()['file'];
            $file->move($this->getParameter('kernel.logs_dir'), $file->getFilename());
            $filePath = $this->getParameter('kernel.logs_dir').'/'.$file->getFilename();

            $translation_texts = [];
            $fp = fopen($filePath, 'r');
            while(($line = fgets($fp)) !== false) {
                $semicolon_pos = strpos($line, ':');
                $transKey = substr($line, 0, $semicolon_pos);
                $transText = trim(substr($line, $semicolon_pos + 1), " \n\r'");
                $translation_texts[$transKey] = $transText;
            }
            fclose($fp);

            unlink($filePath);

            $trans_key_settings = null;
            if (!empty($translation_texts)) {
                $trans_key_settings = [
                    'matching' => 'eq',
                    'transKeys' => array_keys($translation_texts),
                ];
            }
            $db_translations = $this->getTranslationManager()
                ->getEnvironmentTranslations($locale_name, $trans_key_settings);

            /**
             * @var Translation $db_translation
             */
            foreach ($db_translations as $db_translation) {
                $db_transKey = $db_translation->getTransKey();
                $db_translation->setTranslation($translation_texts[$db_transKey]);
                unset($translation_texts[$db_transKey]);
            }

            if (!empty($translation_texts)) {
                $locale = $this->getLocaleManager()->getOneLocaleByShortName($locale_name);
                foreach ($translation_texts as $transKey => $transText) {
                    if (!empty($transKey)) {
                        $new_translation = new Translation();
                        $new_translation->setTranslation($transText);
                        $new_translation->setTransKey($transKey);
                        $new_translation->setLocale($locale);
                        $em->persist($new_translation);
                    }
                }
            }

            $em->flush();
            $this->clearTranslationsCache();

            return $this->redirectToRoute('govwiki_admin_localization_showlocale', [
                'environment' => $this->getCurrentEnvironment()->getSlug(),
                'locale_name' => $locale_name
            ]);
        }

        return [
            'form' => $form->createView(),
            'locale_name' => $locale_name
        ];
    }



    /**
     * @Configuration\Route("/{locale_name}/translation/create")
     * @Configuration\Template()
     *
     * @param Request $request A Request instance.
     * @param string  $locale_name Locale shortName.
     *
     * @return \Symfony\Component\HttpFoundation\JsonResponse
     */
    public function createTranslationAction(Request $request, $locale_name)
    {
        if ($this->getCurrentEnvironment() === null) {
            return $this->redirectToRoute('govwiki_admin_main_home');
        }

        $em = $this->getDoctrine()->getManager();

        $new_translation = new Translation();
        $form = $this->createFormBuilder($new_translation)
            ->add('transKey')
            ->add('translation')
            ->getForm();
        $form->handleRequest($request);

        if ($form->isValid()) {
            $transKey = $new_translation->getTransKey();
            $transText = $new_translation->getTranslation();

            $all_env_locale_names = [];
            foreach ($this->getLocaleManager()->getListLocaleNames() as $row) {
                $all_env_locale_names[] = $row['shortName'];
            }

            $trans_key_settings = null;
            if (!empty($transKey)) {
                $trans_key_settings = [
                    'matching' => 'eq',
                    'transKeys' => [$transKey],
                ];
            }
            $existing_translations = $this->getTranslationManager()
                ->getEnvironmentTranslations(null, $trans_key_settings);

            $existing_translations_locale_names = [];
            foreach ($existing_translations as $translation) {
                $existing_translations_locale_names[] = $translation->getLocale()->getShortName();
            }

            $create_translations_locale_names = array_diff($all_env_locale_names, $existing_translations_locale_names);

            if (!in_array($locale_name, $existing_translations_locale_names, true)) {
                $locale = $this->getLocaleManager()->getOneLocaleByShortName($locale_name);

                $new_translation->setLocale($locale);
                $em->persist($new_translation);

                $create_translations_locale_names = array_diff($create_translations_locale_names, [$locale_name]);

                foreach ($create_translations_locale_names as $create_translations_locale_name) {
                    $locale = $this->getLocaleManager()->getOneLocaleByShortName($create_translations_locale_name);

                    $another_translation = new Translation();
                    $another_translation->setTransKey($transKey);
                    $another_translation->setTranslation($transText);
                    $another_translation->setLocale($locale);
                    $em->persist($another_translation);
                }

                $em->flush();
                $this->clearTranslationsCache();

                return $this->redirectToRoute('govwiki_admin_localization_showlocale', [
                    'environment' => $this->getCurrentEnvironment()->getSlug(),
                    'locale_name' => $locale_name
                ]);
            } else {
                $this->addFlash('error', 'Translation with this key exists.');
            }
        }

        return [
            'form' => $form->createView(),
            'locale_name' => $locale_name
        ];
    }

    /**
     * @Configuration\Route("/{locale_name}/translation/{transKey}/edit")
     * @Configuration\Template()
     *
     * @param Request $request    A Request instance.
     * @param string $transKey    Translation key.
     * @param string $locale_name Locale shortName.
     *
     * @return array
     *
     * @throws AccessDeniedException User don't allow to manage current
     * localization.
     */
    public function editTranslationAction(Request $request, $transKey, $locale_name)
    {
        if ($this->getCurrentEnvironment() === null) {
            return $this->redirectToRoute('govwiki_admin_main_home');
        }

        $em = $this->getDoctrine()->getManager();

        $needOneResult = true;
        $trans_key_settings = null;
        if (!empty($transKey)) {
            $trans_key_settings = [
                'matching' => 'eq',
                'transKeys' => [$transKey],
            ];
        }
        $translation = $this->getTranslationManager()
            ->getEnvironmentTranslations($locale_name, $trans_key_settings, null, $needOneResult);

        $type = null;
        if ($translation->getTransTextareaType() === 'ckeditor') {
            $type = 'ckeditor';
        }
        $form = $this->createForm(new TranslationForm($type), $translation);

        $form->handleRequest($request);
        if ($form->isValid()) {
            $em->persist($translation);
            $em->flush();
            $this->clearTranslationsCache();

            return $this->redirectToRoute('govwiki_admin_localization_showlocale', [
                'environment' => $this->getCurrentEnvironment()->getSlug(),
                'locale_name' => $locale_name
            ]);
        }

        return [
            'form' => $form->createView(),
            'locale_name' => $locale_name,
            'transKey' => $transKey
        ];
    }

    /**
     * Remove translation with $transKey from all localizations
     *
     * @Configuration\Route("/{locale_name}/translation/{transKey}/remove")
     *
     * @param string $transKey    Translation key.
     * @param string $locale_name Locale shortName.
     *
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     *
     * @throws AccessDeniedException User don't allow to manage current
     * localization.
     */
    public function removeTranslationAction($transKey, $locale_name)
    {
        if ($this->getCurrentEnvironment() === null) {
            return $this->redirectToRoute('govwiki_admin_main_home');
        }

        $em = $this->getDoctrine()->getManager();

        $trans_key_settings = null;
        if (!empty($transKey)) {
            $trans_key_settings = [
                'matching' => 'eq',
                'transKeys' => [$transKey],
            ];
        }
        $trans_list = $this->getTranslationManager()
            ->getEnvironmentTranslations($locale_name, $trans_key_settings);

        foreach ($trans_list as $translation) {
            $em->remove($translation);
        }
        $em->flush();
        $this->clearTranslationsCache();

        return $this->redirectToRoute('govwiki_admin_localization_showlocale', [
            'environment' => $this->getCurrentEnvironment()->getSlug(),
            'locale_name' => $locale_name,
        ]);
    }

    /**
     * @Configuration\Route("/createInitialEnTranslation")
     *
     * @param Request $request A Request instance.
     * @return \Symfony\Component\HttpFoundation\JsonResponse
     */
    public function createInitialEnTranslationAction(Request $request)
    {
        if ($this->getCurrentEnvironment() === null) {
            return $this->redirectToRoute('govwiki_admin_main_home');
        }

        $trans_key = $request->get('trans_key');
        $trans_text = $request->get('trans_text');

        $em = $this->getDoctrine()->getManager();

        $locale = $this->getLocaleManager()->getOneLocaleByShortName('en');

        $trans_key_settings = null;
        if (!empty($trans_key)) {
            $trans_key_settings = [
                'matching' => 'eq',
                'transKeys' => [$trans_key],
            ];
        }
        $exist_translation = $this->getTranslationManager()
            ->getEnvironmentTranslations('en', $trans_key_settings);

        if (!$exist_translation) {
            $translation = new Translation();
            $translation->setTransKey($trans_key);
            $translation->setLocale($locale);
            $translation->setTranslation($trans_text);
            $em->persist($translation);
        }
        $em->flush();
        $this->clearTranslationsCache();

        return new JsonResponse([
            'result' => true
        ]);
    }

    /**
     * @return \GovWiki\AdminBundle\Manager\Entity\AdminLocaleManager
     */
    private function getLocaleManager()
    {
        return $this->get(GovWikiAdminServices::LOCALE_MANAGER);
    }

    /**
     * @return \GovWiki\AdminBundle\Manager\Entity\AdminTranslationManager
     */
    private function getTranslationManager()
    {
        return $this->get(GovWikiAdminServices::TRANSLATION_MANAGER);
    }

    /**
     * Remove translation cache.
     *
     * @return void
     */
    private function clearTranslationsCache()
    {
        $cacheDir = __DIR__ . "/../../../../app/cache";
        $finder = new Finder();
        $finder->in([
            $cacheDir . "/" . $this->container->getParameter('kernel.environment') . "/translations"
        ])->files();

        foreach($finder as $file){
            unlink($file->getRealpath());
        }
    }
}
