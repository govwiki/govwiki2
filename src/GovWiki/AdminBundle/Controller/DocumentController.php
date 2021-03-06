<?php

namespace GovWiki\AdminBundle\Controller;

use GovWiki\DbBundle\Entity\Document;
use GovWiki\DbBundle\Entity\Government;
use GovWiki\DbBundle\Entity\Issue;
use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class DocumentController
 * @package GovWiki\AdminBundle\Controller
 *
 * @Configuration\Route(
 *  "/{environment}/government/{government}/documents",
 *  requirements={
 *      "environment": "\w+",
 *      "government": "\d+"
 *  }
 * )
 */
class DocumentController extends AbstractGovWikiAdminController
{
    const MAX_PER_PAGE = 25;

    /**
     * @Configuration\Route("/")
     * @Configuration\Template()
     *
     * @param Request    $request    A Request instance.
     * @param Government $government A Government entity instance.
     *
     * @return array
     *
     * @throws \InvalidArgumentException Can't fetch 'filter' from query string.
     * @throws \LogicException Some required bundle not registered.
     */
    public function indexAction(Request $request, Government $government)
    {
        if ($this->getCurrentEnvironment() === null) {
            return $this->redirectToRoute('govwiki_admin_main_home');
        }

        $date = null;
        if ($filter = $request->query->get('filter')) {
            if (!empty($filter['date'])) {
                $date = $filter['date'];
            }
        }

        return [
            'government' => $government,
            'documents' => $this->paginate(
                $this->getDoctrine()->getRepository('GovWikiDbBundle:Issue')
                    ->getListAllQuery($government->getId(), $date),
                $request->query->getInt('page', 1),
                self::MAX_PER_PAGE
            ),
        ];
    }


    /**
     * @Configuration\Route("/new")
     * @Configuration\Template()
     *
     * @param Request    $request    A Request instance.
     * @param Government $government A Government entity instance.
     *
     * @return array
     *
     * @throws \LogicException Some required bundle not registered.
     * @throws \InvalidArgumentException Invalid entity manager.
     */
    public function newAction(Request $request, Government $government)
    {
        if ($this->getCurrentEnvironment() === null) {
            return $this->redirectToRoute('govwiki_admin_main_home');
        }

        $document = new Issue();
        $document
            ->setGovernment($government)
            ->setCreator($this->getUser());
        $form = $this->createForm('document', $document);

        $form->handleRequest($request);
        if ($this->manageForm($form)) {
            return $this->redirectToRoute('govwiki_admin_document_edit', [
                'environment' => $this->getCurrentEnvironment()->getSlug(),
                'government' => $government->getId(),
                'document' => $document->getId(),
            ]);
        }

        return [
            'government' => $government,
            'form' => $form->createView(),
        ];
    }

    /**
     * @Configuration\Route(
     *  "/{document}/edit",
     *  requirements={ "document": "\d+"}
     * )
     * @Configuration\Template()
     *
     * @param Request    $request    A Request instance.
     * @param Government $government A Government entity instance.
     * @param Issue      $document   A Document entity instance.
     *
     * @return array
     *
     * @throws \LogicException Some required bundle not registered.
     * @throws \InvalidArgumentException Invalid entity manager.
     */
    public function editAction(
        Request $request,
        Government $government,
        Issue $document
    ) {
        if ($this->getCurrentEnvironment() === null) {
            return $this->redirectToRoute('govwiki_admin_main_home');
        }

        $form = $this->createForm('document', $document);

        $form->handleRequest($request);
        if ($this->manageForm($form)) {
            return $this->redirectToRoute('govwiki_admin_document_index', [
                'environment' => $this->getCurrentEnvironment()->getSlug(),
                'government' => $government->getId()
            ]);
        }

        return [
            'government' => $government,
            'document' => $document,
            'form' => $form->createView(),
        ];
    }

    /**
     * @Configuration\Route(
     *  "/{document}/remove",
     *  requirements={ "document": "\d+"}
     * )
     *
     * @param integer $government Government entity id.
     * @param Issue   $document   A Document entity instance.
     *
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     *
     * @throws \LogicException Some required bundle not registered.
     * @throws \InvalidArgumentException Invalid entity manager.
     */
    public function deleteAction($government, Issue $document)
    {
        if ($this->getCurrentEnvironment() === null) {
            return $this->redirectToRoute('govwiki_admin_main_home');
        }

        $em = $this->getDoctrine()->getManager();
        $em->remove($document);
        $em->flush();

        return $this->redirectToRoute('govwiki_admin_document_index', [
            'environment' => $this->getCurrentEnvironment()->getSlug(),
            'government' => $government,
        ]);
    }

    /**
     * @param FormInterface $form A FormInterface instance.
     *
     * @return boolean
     *
     * @throws \LogicException Some required bundle not registered.
     * @throws \InvalidArgumentException Invalid entity manager.
     */
    public function manageForm(FormInterface $form)
    {
        if ($form->isSubmitted() && $form->isValid()) {
            $em = $this->getDoctrine()->getManager();

            $em->persist($form->getData());
            $em->flush();

            return true;
        }

        return false;
    }

    /**
     * @Configuration\Route(
     *  "/{issue}/approve",
     *  requirements={ "issue": "\d+"}
     * )
     *
     * @param integer $government A Government entity id.
     * @param Issue   $issue      A Issue entity instance.
     *
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function approveAction($government, Issue $issue)
    {
        $em = $this->getDoctrine()->getManager();

        $issue->setState(Issue::APPROVED);
        $em->persist($issue);
        $em->flush();

        return $this->redirectToRoute('govwiki_admin_document_index', [
            'environment' => $this->getCurrentEnvironment()->getSlug(),
            'government' => $government,
        ]);
    }

    /**
     * @Configuration\Route(
     *  "/{issue}/discard",
     *  requirements={ "issue": "\d+"}
     * )
     *
     * @param integer $government A Government entity id.
     * @param Issue   $issue      A Issue entity instance.
     *
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function discardAction($government, Issue $issue)
    {
        $em = $this->getDoctrine()->getManager();

        $issue->setState(Issue::DISCARDED);
        $em->persist($issue);
        $em->flush();

        return $this->redirectToRoute('govwiki_admin_document_index', [
            'environment' => $this->getCurrentEnvironment()->getSlug(),
            'government' => $government,
        ]);
    }
}
