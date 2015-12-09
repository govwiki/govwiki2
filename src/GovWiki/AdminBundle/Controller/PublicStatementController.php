<?php

namespace GovWiki\AdminBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use GovWiki\DbBundle\Entity\ElectedOfficial;
use GovWiki\DbBundle\Entity\PublicStatement;
use GovWiki\DbBundle\Form\PublicStatementType;

/**
 * PublicStatementController all actions use xmlHttpRequest, and partials as default template
 */
class PublicStatementController extends Controller
{
    /**
     * @Route("/electedofficial/{id}/publicstatement/create", methods="GET|POST")
     * @Template("GovWikiAdminBundle:ElectedOfficial:_public_statement_modal_form.html.twig")
     *
     * @param Request         $request
     * @param ElectedOfficial $electedOfficial
     * @return Response|JsonResponse
     */
    public function createAction(Request $request, ElectedOfficial $electedOfficial)
    {
        $publicStatement = new PublicStatement;

        $form = $this->createForm(new PublicStatementType(), $publicStatement);
        $form->handleRequest($request);

        if ($form->isValid()) {
            $em = $this->getDoctrine()->getManager();

            $publicStatement->setElectedOfficial($electedOfficial);
            $em->persist($publicStatement);
            $em->flush();

            return new JsonResponse(['reload' => true]);
        }

        return [
            'form'   => $form->createView(),
            'action' => $this->generateUrl('govwiki_admin_publicstatement_create', ['id' => $electedOfficial->getId()]),
        ];
    }

    /**
     * @Route("/publicstatement/{id}/edit", methods="GET|POST", requirements={"id": "\d+"})
     * @Template("GovWikiAdminBundle:ElectedOfficial:_public_statement_modal_form.html.twig")
     *
     * @param PublicStatement $publicStatement
     * @param Request         $request
     * @return Response|JsonResponse
     */
    public function editAction(PublicStatement $publicStatement, Request $request)
    {
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
     * @Route("/publicstatement/{id}/remove")
     *
     * @param PublicStatement $publicStatement
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
