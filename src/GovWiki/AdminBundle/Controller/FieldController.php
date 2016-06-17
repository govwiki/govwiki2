<?php

namespace GovWiki\AdminBundle\Controller;

use GovWiki\AdminBundle\GovWikiAdminServices;
use GovWiki\DbBundle\Entity\Format;
use GovWiki\DbBundle\Entity\Locale;
use GovWiki\DbBundle\Entity\Translation;
use GovWiki\DbBundle\Form\FormatType;
use GovWiki\EnvironmentBundle\Strategy\GovwikiNamingStrategy;
use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class FieldController
 * @package GovWiki\AdminBundle\Controller
 *
 * @Configuration\Route(
 *  "/{environment}/category/{category}/field",
 *  requirements={
 *      "environment": "\w+",
 *      "category": "\d+"
 *  }
 * )
 */
class FieldController extends AbstractGovWikiAdminController
{

    /**
     * @Configuration\Route(
     *  "/new",
     *  requirements={ "category": "\d+" }
     * )
     * @Configuration\Template()
     *
     * @param Request $request  A Request instance.
     * @param integer $category A Category entity id.
     *
     * @return array|\Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function newAction(Request $request, $category)
    {
        if ($this->getCurrentEnvironment() === null) {
            return $this->redirectToRoute('govwiki_admin_main_home');
        }

        $em = $this->get('doctrine.orm.default_entity_manager');
        $categoryReference = $em->getReference(
            'GovWikiDbBundle:Category',
            $category
        );

        $format = $this->getManager()->create();
        $format->setCategory($categoryReference);

        $form = $this->createForm(new FormatType(), $format);
        $form->handleRequest($request);

        if ($form->isValid() && $form->isSubmitted()) {
            $environment = $this->getCurrentEnvironment();

            $this->getManager()->update($format);

            $this->getGovernmentManager()->addColumn(
                $environment,
                $format->getField(),
                $format->getType()
            );

            $this->changeFormatTranslation('new', $format->getField(), $format->getName());
            if (!is_null($format->getHelpText())) {
                $this->changeFormatTranslation('new', $format->getField() . '.help_text', $format->getHelpText());
            }

            return $this->redirectToRoute('govwiki_admin_environment_format', [
                'environment' => $environment->getSlug(),
            ]);
        }

        return [ 'form' => $form->createView() ];
    }

    /**
     * @Configuration\Route(
     *  "/{format}/edit",
     *  requirements={ "format": "\d+" }
     * )
     * @Configuration\Template()
     *
     * @param Request $request A Request instance.
     * @param Format  $format  A Format instance.
     *
     * @return array
     */
    public function editAction(Request $request, Format $format)
    {
        if ($this->getCurrentEnvironment() === null) {
            return $this->redirectToRoute('govwiki_admin_main_home');
        }

        $form = $this->createForm(new FormatType(), $format);

        $oldFieldName = $format->getField();
        $oldIsRanked = $format->isRanked();

        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid() ) {
            $this->getManager()->update($format);

            $environment = $this->getCurrentEnvironment();
            $manager = $this->getGovernmentManager();

            if ($format->isRanked()) {
                if ($oldIsRanked) {
                    $manager->changeColumn(
                        $environment,
                        GovwikiNamingStrategy::rankedFieldName($oldFieldName),
                        GovwikiNamingStrategy::rankedFieldName($format->getField()),
                        'integer'
                    );
                } else {
                    $manager->addColumn(
                        $environment,
                        GovwikiNamingStrategy::rankedFieldName($format->getField()),
                        'integer'
                    );
                }
            } elseif ($oldIsRanked) {
                $manager->deleteColumn(
                    $environment,
                    GovwikiNamingStrategy::rankedFieldName($format->getField())
                );
            }

            $manager->changeColumn(
                $environment,
                $oldFieldName,
                $format->getField(),
                $format->getType()
            );

            $this->changeFormatTranslation('edit', $format->getField(), $format->getName());
            $this->changeFormatTranslation('edit', $format->getField() . '.help_text', $format->getHelpText());

            return $this->redirectToRoute('govwiki_admin_environment_format', [
                'environment' => $environment->getSlug(),
            ]);
        }

        return [
            'form' => $form->createView(),
            'format' => $format,
        ];
    }

    /**
     * @Configuration\Route(
     *  "/{format}/delete",
     *  requirements={"format": "\d+"}
     * )
     *
     * @param Format $format A Format instance.
     *
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function removeAction(Format $format)
    {
        if ($this->getCurrentEnvironment() === null) {
            return $this->redirectToRoute('govwiki_admin_main_home');
        }

        $em = $this->getDoctrine()->getManager();

        $environment = $this->getCurrentEnvironment();
        $manager = $this->getGovernmentManager();

        $manager->deleteColumn($environment, $format->getField());

        if ($format->isRanked()) {
            $manager->deleteColumn(
                $environment,
                GovwikiNamingStrategy::rankedFieldName($format->getField())
            );
        }

        $this->changeFormatTranslation('remove', $format->getField());
        $this->changeFormatTranslation('remove', $format->getField() . '.help_text');

        $em->remove($format);
        $em->flush();

        return $this->redirectToRoute('govwiki_admin_environment_format', [
            'environment' => $environment->getSlug(),
        ]);
    }

    /**
     * @param string $action Action that will be executed on tab translation.
     * @param integer $format_field Format Field for TransKey
     * @param string $format_name Format Name for Translation's text
     */
    private function changeFormatTranslation($action, $format_field, $format_name = null)
    {
        $em = $this->getDoctrine()->getManager();

        $transKey = 'format.' . $format_field;
        $needOneResult = true;
        $trans_key_settings = null;
        if (!empty($transKey)) {
            $trans_key_settings = [
                'matching' => 'eq',
                'transKeys' => [$transKey]
            ];
        }

        $locale_list = $this->getLocaleManager()->getListLocales();

        /** @var Locale $locale */
        foreach ($locale_list as $locale) {
            /** @var Translation $translation */
            if ('new' == $action) {
                $translation = new Translation();
                $translation->setTransKey($transKey);
                $translation->setTranslation($format_name);
                $translation->setLocale($locale);
                $em->persist($translation);
            } elseif ('edit' == $action) {
                $translation = $this->getTranslationManager()
                    ->getEnvironmentTranslations($locale->getShortName(), $trans_key_settings, null, $needOneResult);
                if (!empty($translation)) {
                    $translation->setTranslation($format_name);
                } else {
                    $translation = new Translation();
                    $translation->setTransKey($transKey);
                    $translation->setTranslation($format_name);
                    $translation->setLocale($locale);
                    $em->persist($translation);
                }
            } elseif ('remove' == $action) {
                $translation = $this->getTranslationManager()
                    ->getEnvironmentTranslations($locale->getShortName(), $trans_key_settings, null, $needOneResult);
                if (!empty($translation)) {
                    $em->remove($translation);
                }
            }
        }
        $em->flush();
    }

    /**
     * @return \GovWiki\AdminBundle\Manager\Entity\AdminFormatManager
     */
    private function getManager()
    {
        return $this->get(GovWikiAdminServices::FORMAT_MANAGER);
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
}
