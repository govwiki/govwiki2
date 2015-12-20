<?php

namespace GovWiki\AdminBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use GovWiki\DbBundle\Entity\ElectedOfficial;
use GovWiki\DbBundle\Entity\PublicStatement;
use GovWiki\DbBundle\Form\PublicStatementType;

/**
 * PublicStatementController all actions use xmlHttpRequest, and partials as
 * default template.
 *
 * @package GovWiki\AdminBundle\Controller
 */
class PublicStatementController extends Controller
{
    /**
     * @Configuration\Route(
     *  "/elected-official/{id}/public-statement/create",
     *  requirements={"id": "\d+"}
     * )
     * @Configuration\Template("GovWikiAdminBundle:ElectedOfficial:_public_statement_modal_form.html.twig")
     *
     * @param Request         $request         A Request instance.
     * @param ElectedOfficial $electedOfficial A ElectedOfficial instance.
     *
     * @return array|JsonResponse
     */
    public function createAction(
        Request $request,
        ElectedOfficial $electedOfficial
    ) {
        $publicStatement = new PublicStatement();

        $form = $this->createForm(new PublicStatementType(), $publicStatement);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $em = $this->getDoctrine()->getManager();

            $publicStatement->setElectedOfficial($electedOfficial);
            $em->persist($publicStatement);
            $em->flush();

            return new JsonResponse(['reload' => true]);
        }

        return [
            'form'   => $form->createView(),
            'action' => $this->generateUrl(
                'govwiki_admin_publicstatement_create',
                ['id' => $electedOfficial->getId()]
            ),
        ];
    }

    /**
     * @Configuration\Route(
     *  "/public-statement/{id}/edit",
     *  requirements={"id": "\d+"}
     * )
     * @Configuration\Template("GovWikiAdminBundle:ElectedOfficial:_public_statement_modal_form.html.twig")
     *
     * @param Request         $request         A Request instance.
     * @param PublicStatement $publicStatement A PublicStatement instance.
     *
*@return array|JsonResponse
     */
    public function editAction(
        Request $request,
        PublicStatement $publicStatement
    ) {
        $form = $this->createForm(new PublicStatementType(), $publicStatement);
        $form->handleRequest($request);

        if ($form->isValid()) {
            $this->getDoctrine()->getManager()->flush();

            return new JsonResponse(['reload' => true]);
        }

        return [
            'form' => $form->createView(),
            'action' => $this->generateUrl('govwiki_admin_publicstatement_edit', ['id' => $publicStatement->getId()]),
        ];
    }

    /**
     * @Configuration\Route("/public-statement/{id}/remove")
     *
     * @param PublicStatement $publicStatement A PublicStatement instance.
     *
     * @return JsonResponse
     */
    public function removeAction(PublicStatement $publicStatement)
    {
        $em = $this->getDoctrine()->getManager();
        $em->remove($publicStatement);
        $em->flush();

        return new JsonResponse(['status' => 'ok']);
    }
}
