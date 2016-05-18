<?php

namespace GovWiki\AdminBundle\Controller;

use GovWiki\AdminBundle\GovWikiAdminServices;
use GovWiki\DbBundle\Entity\Category;
use GovWiki\DbBundle\Entity\Locale;
use GovWiki\DbBundle\Entity\Tab;
use GovWiki\DbBundle\Entity\Translation;
use GovWiki\DbBundle\Form\AbstractGroupType;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\HttpFoundation\Request;
use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;

/**
 * Class TabController
 * @package GovWiki\AdminBundle\Controller
 *
 * @Configuration\Route(
 *  "{environment}/tab",
 *  requirements={ "environment": "\w+" }
 * )
 */
class TabController extends AbstractGovWikiAdminController
{

    /**
     * Create new tab.
     *
     * @Configuration\Route("/new")
     * @Configuration\Template
     *
     * @param Request $request A Request instance.
     *
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function newAction(Request $request)
    {
        if ($this->getCurrentEnvironment() === null) {
            return $this->redirectToRoute('govwiki_admin_main_home');
        }

        $tab = $this->getManager()->create();
        $form = $this->createForm(new AbstractGroupType(), $tab);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $em = $this->getDoctrine()->getManager();

            $category = new Category();
            $category
                ->setTab($tab)
                ->setOrderNumber(99)
                ->setEnvironment($this->getCurrentEnvironment())
                ->setName('Main');
            $tab->addCategory($category);

            $em->persist($category);
            $em->persist($tab);
            $em->flush();

            $this->changeTabTranslation('new', $tab->getId(), $tab->getName());
            $this->changeTabTranslation('new', $category->getId(), $category->getName());

            return $this->redirectToRoute('govwiki_admin_environment_format', [
                'environment' => $this->getCurrentEnvironment()->getSlug(),
            ]);
        }

        return [ 'form' => $form->createView() ];
    }

    /**
     * Edit given tab.
     *
     * @Configuration\Route(
     *  "/{tab}/edit",
     *  requirements={"tab": "\d+"}
     * )
     * @Configuration\Template
     *
     * @param Request $request A Request instance.
     * @param Tab     $tab     A Tab entity instance.
     *
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function editAction(Request $request, Tab $tab)
    {
        if ($this->getCurrentEnvironment() === null) {
            return $this->redirectToRoute('govwiki_admin_main_home');
        }

        $form = $this->createForm(new AbstractGroupType(), $tab);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $em = $this->getDoctrine()->getManager();

            $em->persist($tab);
            $em->flush();

            $this->changeTabTranslation('edit', $tab->getId(), $tab->getName());

            return $this->redirectToRoute('govwiki_admin_environment_format', [
                'environment' => $this->getCurrentEnvironment()->getSlug(),
            ]);
        }

        return [
            'form' => $form->createView(),
            'tab' => $tab,
        ];
    }

    /**
     * Remove given tab.
     *
     * @Configuration\Route(
     *  "/{tab}/remove",
     *  requirements={"tab": "\d+"}
     * )
     * @param integer $tab A Tab entity id.
     *
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function removeAction($tab)
    {
        if ($this->getCurrentEnvironment() === null) {
            return $this->redirectToRoute('govwiki_admin_main_home');
        }

        $em = $this->get('doctrine.orm.default_entity_manager');

        $this->changeTabTranslation('remove', $tab);

        $expr = $em->getExpressionBuilder();

        // Remove category taranslations.
        $categories = $em->getRepository('GovWikiDbBundle:Category')
            ->createQueryBuilder('Category')
            ->select('Category.id')
            ->where($expr->eq('Category.tab', ':tab'))
            ->setParameter('tab', $tab)
            ->getQuery()
            ->getArrayResult();

        $categories = array_map(
            function (array $row) {
                return $row['id'];
            },
            $categories
        );

        foreach ($categories as $category) {
            $this->changeTabTranslation('remove', $category);
        }

        // Remove field from government environment related table.
        $formats = $em->getRepository('GovWikiDbBundle:Format')
            ->createQueryBuilder('Format')
            ->select('Format.field')
            ->where($expr->in('Format.category', $categories))
            ->getQuery()
            ->getArrayResult();
        $formats = array_map(
            function (array $row) {
                return $row['field'];
            },
            $formats
        );

        $manager = $this->getGovernmentManager();
        $environment = $this->getCurrentEnvironment();
        foreach ($formats as $format) {
            $manager->deleteColumn($environment, $format);
            $this->changeFormatTranslation('remove', $format);
        }

        $em->getConnection()->exec("
            DELETE f FROM `formats` f
            JOIN `groups` c ON c.id = f.category_id
            WHERE
                c.tab_id = {$tab} AND
                c.type = 'category'
        ");

        $em->getRepository('GovWikiDbBundle:Category')
            ->createQueryBuilder('Category')
            ->delete()
            ->where($expr->eq('Category.tab', ':tab'))
            ->setParameter('tab', $tab)
            ->getQuery()
            ->execute();

        $em->getRepository('GovWikiDbBundle:Tab')
            ->createQueryBuilder('Tab')
            ->delete()
            ->where($expr->eq('Tab.id', ':tab'))
            ->setParameter('tab', $tab)
            ->getQuery()
            ->execute();

        return $this->redirectToRoute('govwiki_admin_environment_format', [
            'environment' => $this->getCurrentEnvironment()->getSlug(),
        ]);
    }
    /**
     * @param string $action Action that will be executed on tab translation.
     * @param integer $tab_id Tab ID for TransKey
     * @param string $tab_name Tab Name for Translation's text
     */
    private function changeTabTranslation($action, $tab_id, $tab_name = null)
    {
        $em = $this->getDoctrine()->getManager();

        $locale = $this->getLocaleManager()->getOneLocaleByShortName('en');
        $transKey = 'groups.group_id_' . $tab_id;
        $needOneResult = true;
        $trans_key_settings = null;
        if (!empty($transKey)) {
            $trans_key_settings = [
                'matching' => 'eq',
                'transKeys' => [$transKey]
            ];
        }

        /** @var Translation $translation */
        if ('new' == $action) {
            $translation = new Translation();
            $translation->setTransKey($transKey);
            $translation->setTranslation($tab_name);
            $translation->setLocale($locale);
            $em->persist($translation);
        } elseif ('edit' == $action) {
            $translation = $this->getTranslationManager()->getTranslationsBySettings('en', $trans_key_settings, null, $needOneResult);
            if (!empty($translation)) {
                $translation->setTranslation($tab_name);
            } else {
                $translation = new Translation();
                $translation->setTransKey($transKey);
                $translation->setTranslation($tab_name);
                $translation->setLocale($locale);
                $em->persist($translation);
            }
        } elseif ('remove' == $action) {
            $translation = $this->getTranslationManager()->getTranslationsBySettings('en', $trans_key_settings, null, $needOneResult);
            if (!empty($translation)) {
                $em->remove($translation);
            }
        }
        $em->flush();
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
     * @return \GovWiki\AdminBundle\Manager\Entity\AdminTabManager
     */
    private function getManager()
    {
        return $this->get(GovWikiAdminServices::TAB_MANAGER);
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
