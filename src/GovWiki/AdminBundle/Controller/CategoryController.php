<?php

namespace GovWiki\AdminBundle\Controller;

use GovWiki\AdminBundle\GovWikiAdminServices;
use GovWiki\DbBundle\Entity\Category;
use GovWiki\DbBundle\Entity\Translation;
use GovWiki\DbBundle\Form\AbstractGroupType;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\HttpFoundation\Request;
use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;

/**
 * Class CategoryController
 * @package GovWiki\AdminBundle\Controller
 *
 * @Configuration\Route("/category")
 */
class CategoryController extends AbstractGovWikiAdminController
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
        return [
            'tabs' => $this->paginate(
                $this->getManager()->getListQuery(),
                $request->query->getInt('page', 1),
                25
            ),
        ];
    }

    /**
     * @Configuration\Route("/{id}/remove")
     * @param Category $category A Category instance.
     *
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function removeAction(Category $category)
    {
        $em = $this->getDoctrine()->getManager();

        $this->changeCategoryTranslation('remove', $category->getId());

        $em->remove($category);
        $em->flush();

        return $this->redirectToRoute('govwiki_admin_category_list');
    }

    /**
     * @Configuration\Route("/{id}/up")
     *
     * @param Category $category A Category instance.
     *
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function upAction(Category $category)
    {
        $this->getManager()->pullUp($category);

        return $this->redirectToRoute('govwiki_admin_category_list');
    }

    /**
     * @Configuration\Route("/{id}/down")
     *
     * @param Category $category A Category instance.
     *
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function downAction(Category $category)
    {
        $this->getManager()->pullDown($category);

        return $this->redirectToRoute('govwiki_admin_category_list');
    }

    /**
     * @Configuration\Route("/new")
     * @Configuration\Template
     *
     * @param Request $request A Request instance.
     *
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function newAction(Request $request)
    {
        $category = $this->getManager()->create();

        $form = $this->createForm(new AbstractGroupType(), $category);

        $this->processForm($request, $form);

        $this->changeCategoryTranslation('new', $category->getId(), $category->getName());

        return [ 'form' => $form->createView() ];
    }

    /**
     * @Configuration\Route("/{id}/edit")
     * @Configuration\Template
     *
     * @param Request  $request  A Request instance.
     * @param Category $category A Category instance.
     *
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function editAction(Request $request, Category $category)
    {
        $form = $this->createForm(new AbstractGroupType(), $category);

        $this->processForm($request, $form);

        $this->changeCategoryTranslation('edit', $category->getId(), $category->getName());

        return [ 'form' => $form->createView() ];
    }

    /**
     * @param Request       $request A Request instance.
     * @param FormInterface $form    A Form instance.
     *
     * @return void
     */
    private function processForm(Request $request, FormInterface $form)
    {
        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            $this->getManager()->update($form->getData());
        }
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
            $trans_key_settings = array(
                'matching' => 'eq',
                'transKeys' => array($transKey)
            );
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
     * @return \GovWiki\AdminBundle\Manager\Entity\AdminCategoryManager
     */
    private function getManager()
    {
        return $this->get(GovWikiAdminServices::CATEGORY_MANAGER);
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
