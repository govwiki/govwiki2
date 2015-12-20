<?php

namespace GovWiki\AdminBundle\Controller;

use GovWiki\AdminBundle\GovWikiAdminServices;
use GovWiki\DbBundle\Entity\Tab;
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
     * @return \GovWiki\AdminBundle\Manager\Entity\AdminTabManager
     */
    private function getManager()
    {
        return $this->get(GovWikiAdminServices::TAB_MANAGER);
    }
}
