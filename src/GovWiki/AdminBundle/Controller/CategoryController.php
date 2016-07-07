<?php

namespace GovWiki\AdminBundle\Controller;

use GovWiki\AdminBundle\GovWikiAdminServices;
use GovWiki\DbBundle\Entity\Category;
use GovWiki\DbBundle\Entity\Translation;
use Symfony\Component\HttpFoundation\Request;
use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;

/**
 * Class CategoryController
 * @package GovWiki\AdminBundle\Controller
 *
 * @Configuration\Route(
 *  "/{environment}/tab/{tab}/category",
 *  requirements={
 *      "environment": "\w+",
 *      "tab": "\d+"
 *  }
 * )
 */
class CategoryController extends AbstractGovWikiAdminController
{

    /**
     * @Configuration\Route("/new")
     * @Configuration\Template()
     *
     * @param Request $request A Request instance.
     * @param integer $tab     A Tab entity id.
     *
     * @return array|\Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function newAction(Request $request, $tab)
    {
        if ($this->getCurrentEnvironment() === null) {
            return $this->redirectToRoute('govwiki_admin_main_home');
        }

        $em = $this->get('doctrine.orm.default_entity_manager');
        $environment = $this->getCurrentEnvironment();
        $tabReference = $em->getReference('GovWikiDbBundle:Tab', $tab);

        $category = new Category();
        $category
            ->setTab($tabReference)
            ->setEnvironment($environment);

        $form = $this->createForm('govwiki_group', $category);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $em->persist($category);
            $em->flush();

            $this->changeCategoryTranslation('new', $category->getId(), $category->getName());

            return $this->redirectToRoute('govwiki_admin_environment_format', [
                'environment' => $environment->getSlug(),
            ]);
        }

        return [ 'form' => $form->createView() ];
    }

    /**
     * @Configuration\Route(
     *  "/{category}/remove",
     *  requirements={ "category": "\d+" }
     * )
     *
     * @param integer $tab      A Tab entity id.
     * @param integer $category A Category entity id.
     *
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function removeAction($tab, $category)
    {
        if ($this->getCurrentEnvironment() === null) {
            return $this->redirectToRoute('govwiki_admin_main_home');
        }

        $em = $this->get('doctrine.orm.default_entity_manager');

        $this->changeCategoryTranslation('remove', $category);

        $expr = $em->getExpressionBuilder();
        $em->getRepository('GovWikiDbBundle:Category')
            ->createQueryBuilder('Category')
            ->delete()
            ->where($expr->andX(
                $expr->eq('Category.tab', ':tab'),
                $expr->eq('Category.id', ':category')
            ))
            ->setParameters([
                'tab' => $tab,
                'category' => $category,
            ])
            ->getQuery()
            ->execute();

        return $this->redirectToRoute('govwiki_admin_environment_format', [
            'environment' => $this->getCurrentEnvironment()->getSlug(),
        ]);
    }

    /**
     * @Configuration\Route(
     *  "/{category}/edit",
     *  requirements={ "category": "\d+" }
     * )
     * @Configuration\Template()
     *
     * @param Request  $request  A Request instance.
     * @param integer  $tab      A Tab entity id.
     * @param Category $category A Category entity instance.
     *
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function editAction(Request $request, $tab, Category $category)
    {
        if ($this->getCurrentEnvironment() === null) {
            return $this->redirectToRoute('govwiki_admin_main_home');
        }

        if ($category->getTab()->getId() === (int)$tab) {
            $form = $this->createForm('govwiki_group', $category);
            $form->handleRequest($request);

            if ($form->isSubmitted() && $form->isValid()) {
                $em = $this->getDoctrine()->getManager();

                $em->persist($category);
                $em->flush();

                return $this->redirectToRoute('govwiki_admin_environment_format', [
                    'environment' => $this-> getCurrentEnvironment()->getSlug(),
                ]);
            }

            $this->changeCategoryTranslation('edit', $category->getId(), $category->getName());

            return [
                'form' => $form->createView(),
                'category' => $category,
            ];
        }

        throw $this->createNotFoundException();
    }

    /**
     * @param string $action Action that will be executed on category translation.
     * @param integer $cat_id Category ID for TransKey
     * @param string $cat_name Category Name for Translation's text
     */
    private function changeCategoryTranslation($action, $cat_id, $cat_name = null)
    {
        $em = $this->getDoctrine()->getManager();

        $locale = $this->getLocaleManager()->getOneLocaleByShortName('en');
        $transKey = 'groups.group_id_' . $cat_id;
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
            $translation->setTranslation($cat_name);
            $translation->setLocale($locale);
            $em->persist($translation);
        } elseif ('edit' == $action) {
            $translation = $this->getTranslationManager()
                ->getEnvironmentTranslations('en', $trans_key_settings, null, $needOneResult);
            if (!empty($translation)) {
                $translation->setTranslation($cat_name);
            } else {
                $translation = new Translation();
                $translation->setTransKey($transKey);
                $translation->setTranslation($cat_name);
                $translation->setLocale($locale);
                $em->persist($translation);
            }
        } elseif ('remove' == $action) {
            $translation = $this->getTranslationManager()
                ->getEnvironmentTranslations('en', $trans_key_settings, null, $needOneResult);
            if (!empty($translation)) {
                $em->remove($translation);
            }
        }
        $em->flush();
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
