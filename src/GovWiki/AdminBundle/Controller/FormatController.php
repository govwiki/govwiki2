<?php

namespace GovWiki\AdminBundle\Controller;

use GovWiki\AdminBundle\GovWikiAdminServices;
use GovWiki\DbBundle\Entity\Format;
use GovWiki\DbBundle\Entity\Locale;
use GovWiki\DbBundle\Entity\Translation;
use GovWiki\DbBundle\Form\AbstractGroupType;
use GovWiki\DbBundle\Form\FormatType;
use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class FormatController
 * @package GovWiki\AdminBundle\Controller
 *
 * @Configuration\Route("/format")
 * @deprecated To remove
 * todo remove
 */
class FormatController extends Controller
{
    /**
     * @Configuration\Route("/")
     * @Configuration\Template()
     *
     * @param Request $request A Request instance.
     *
     * @return array
     */
    public function listAction(Request $request)
    {
        $fields = $this->get('knp_paginator')->paginate(
            $this->getManager()->getListQuery(),
            $request->query->getInt('page', 1),
            25
        );

        $form = $this->createForm(new AbstractGroupType());

        return [
            'fields' => $fields,
            'form' => $form->createView(),
        ];
    }

    /**
     * @Configuration\Route(
     *  "/{id}/edit",
     *  requirements={"id": "\d+"}
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
        $form = $this->createForm('format', $format);

        $oldFieldName = $format->getField();
        $oldIsRanked = $format->isRanked();

        $form->handleRequest($request);
        if ($this->processForm($form) ) {
            $manager = $this->get(GovWikiAdminServices::ADMIN_ENVIRONMENT_MANAGER);
            if ($format->isRanked()) {
                if ($oldIsRanked) {
                    $manager->changeColumnInGovernment(
                        $oldFieldName . '_rank',
                        $format->getField() . '_rank',
                        'integer'
                    );
                } else {
                    $manager->addColumnToGovernment(
                        $format->getField() . '_rank',
                        'integer'
                    );
                }
            } elseif ($oldIsRanked) {
                $manager->deleteColumnFromGovernment($oldFieldName . '_rank');
            }

            $manager->changeColumnInGovernment(
                $oldFieldName,
                $format->getField(),
                $format->getType()
            );

            $this->changeFormatTranslation('edit', $format->getField(), $format->getName());
            $this->changeFormatTranslation('edit', $format->getField() . '.help_text', $format->getHelpText());
        }

        return [ 'form' => $form->createView() ];
    }

    /**
     * @Configuration\Route("/new")
     * @Configuration\Template()
     *
     * @param Request $request A Request instance.
     *
     * @return array|\Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function newAction(Request $request)
    {
        $format = $this->getManager()->create();

        $form = $this->createForm('format', $format);
        $form->handleRequest($request);
        if ($this->processForm($form)) {
            $manager = $this
                ->get(GovWikiAdminServices::ADMIN_ENVIRONMENT_MANAGER);

            $manager->addColumnToGovernment(
                $format->getField(),
                $format->getType()
            );

            $this->changeFormatTranslation('new', $format->getField(), $format->getName());
            if (!is_null($format->getHelpText())) {
                $this->changeFormatTranslation('new', $format->getField() . '.help_text', $format->getHelpText());
            }

            return $this->redirectToRoute('govwiki_admin_format_edit', [
                'id' => $format->getId(),
            ]);
        }

        return [ 'form' => $form->createView() ];
    }

    /**
     * @Configuration\Route(
     *  "/{id}/delete",
     *  requirements={"id": "\d+"}
     * )
     *
     * @param Format $format A Format instance.
     *
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function removeAction(Format $format)
    {
        $em = $this->getDoctrine()->getManager();

        $this->changeFormatTranslation('remove', $format->getField());
        $this->changeFormatTranslation('remove', $format->getField() . '.help_text');

        $em->remove($format);
        $em->flush();

        return $this->redirectToRoute('govwiki_admin_format_list');
    }

    /**
     * @param FormInterface $form A FormInterface instance.
     *
     * @return boolean
     */
    private function processForm(FormInterface $form)
    {
        if ($form->isSubmitted() && $form->isValid()) {
            $this->getManager()->update($form->getData());
            return true;
        }

        return false;
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
            $trans_key_settings = array(
                'matching' => 'eq',
                'transKeys' => array($transKey)
            );
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
                $translation = $this->getTranslationManager()->getTranslationsBySettings($locale->getShortName(), $trans_key_settings, null, $needOneResult);
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
                $translation = $this->getTranslationManager()->getTranslationsBySettings($locale->getShortName(), $trans_key_settings, null, $needOneResult);
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
