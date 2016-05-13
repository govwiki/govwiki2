<?php

namespace GovWiki\AdminBundle\Controller;

use GovWiki\DbBundle\Entity\Document;
use GovWiki\DbBundle\Entity\Government;
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
        $type = null;
        $date = null;
        if ($filter = $request->query->get('filter')) {
            if (!empty($filter['type'])) {
                $type = (int) $filter['type'];
            }
            if (!empty($filter['date'])) {
                $date = $filter['date'];
            }
        }

        return [
            'government' => $government,
            'documents' => $this->paginate(
                $this->getDoctrine()->getRepository('GovWikiDbBundle:Document')
                    ->getListQuery($government->getId(), $type, $date),
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
        $document = new Document();
        $document->setGovernment($government);
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
     * @param Document   $document   A Document entity instance.
     *
     * @return array
     *
     * @throws \LogicException Some required bundle not registered.
     * @throws \InvalidArgumentException Invalid entity manager.
     */
    public function editAction(
        Request $request,
        Government $government,
        Document $document
    ) {
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
     * @param integer  $government Government entity id.
     * @param Document $document   A Document entity instance.
     *
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     *
     * @throws \LogicException Some required bundle not registered.
     * @throws \InvalidArgumentException Invalid entity manager.
     */
    public function deleteAction($government, Document $document)
    {
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
}
