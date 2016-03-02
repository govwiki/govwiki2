<?php

namespace GovWiki\AdminBundle\Controller;

use GovWiki\AdminBundle\GovWikiAdminServices;
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
 * @Configuration\Route("/tab")
 */
class TabController extends AbstractGovWikiAdminController
{
    /**
     * List available tabs.
     *
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
     * Remove given tab.
     *
     * @Configuration\Route("/{id}/remove", requirements={"id": "\d+"})
     * @param Tab $tab A Tab instance.
     *
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function removeAction(Tab $tab)
    {
        $em = $this->getDoctrine()->getManager();

        $this->changeTabTranslation('remove', $tab->getId());

        $em->remove($tab);
        $em->flush();

        return $this->redirectToRoute('govwiki_admin_tab_list');
    }

    /**
     * Move given tab up.
     *
     * @Configuration\Route("/{id}/up", requirements={"id": "\d+"})
     *
     * @param Tab $tab A Tab instance.
     *
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function upAction(Tab $tab)
    {
        $this->getManager()->pullUp($tab);

        return $this->redirectToRoute('govwiki_admin_tab_list');
    }

    /**
     * Move given tab down.
     *
     * @Configuration\Route("/{id}/down", requirements={"id": "\d+"})
     *
     * @param Tab $tab A Tab instance.
     *
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function downAction(Tab $tab)
    {
        $this->getManager()->pullDown($tab);

        return $this->redirectToRoute('govwiki_admin_tab_list');
    }

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
        $tab = $this->getManager()->create();
        $form = $this->createForm(new AbstractGroupType(), $tab);

        $this->processForm($request, $form);

        $this->changeTabTranslation('new', $tab->getId(), $tab->getName());

        return [ 'form' => $form->createView() ];
    }

    /**
     * Edit given tab.
     *
     * @Configuration\Route("/{id}/edit", requirements={"id": "\d+"})
     * @Configuration\Template
     *
     * @param Request $request A Request instance.
     * @param Tab     $tab     A Tab instance.
     *
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function editAction(Request $request, Tab $tab)
    {
        $form = $this->createForm(new AbstractGroupType(), $tab);

        $this->processForm($request, $form);

        $this->changeTabTranslation('edit', $tab->getId(), $tab->getName());

        return [ 'form' => $form->createView() ];
    }

    /**
     * Process tab form.
     *
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
            $trans_key_settings = array(
                'matching' => 'eq',
                'transKeys' => array($transKey)
            );
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
