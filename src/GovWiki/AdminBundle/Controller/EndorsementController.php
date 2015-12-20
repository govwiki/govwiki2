<?php

namespace GovWiki\AdminBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use GovWiki\DbBundle\Entity\ElectedOfficial;
use GovWiki\DbBundle\Entity\Endorsement;
use GovWiki\DbBundle\Form\EndorsementType;

/**
 * EndorsementController all actions use xmlHttpRequest, and partials as default
 * template.
 *
 * @package GovWiki\AdminBundle\Controller
 */
class EndorsementController extends Controller
{
    /**
     * @Configuration\Route(
     *  "/elected-official/{id}/endorsement/create",
     *  requirements={"id": "\d+"}
     * )
     * @Configuration\Template("GovWikiAdminBundle:ElectedOfficial:_endorsement_modal_form.html.twig")
     *
     * @param Request         $request         A Request instance.
     * @param ElectedOfficial $electedOfficial A ElectedOfficial instance.
     *
     * @return array|JsonResponse
     */
    public function createAction(Request $request, ElectedOfficial $electedOfficial)
    {
        $endorsement = new Endorsement();

        $form = $this->createForm(new EndorsementType(), $endorsement);
        $form->handleRequest($request);

        if ($form->isValid()) {
            $em = $this->getDoctrine()->getManager();

            $endorsement->setElectedOfficial($electedOfficial);
            $em->persist($endorsement);
            $em->flush();

            return new JsonResponse(['reload' => true]);
        }

        return [
            'form'   => $form->createView(),
            'action' => $this->generateUrl(
                'govwiki_admin_endorsement_create',
                ['id' => $electedOfficial->getId()]
            ),
        ];
    }

    /**
     * @Configuration\Route(
     *  "/endorsement/{id}/edit",
     *  requirements={"id": "\d+"}
     * )
     * @Configuration\Template("GovWikiAdminBundle:ElectedOfficial:_endorsement_modal_form.html.twig")
     *
     * @param Request     $request     A Request instance.
     * @param Endorsement $endorsement A Endorsement instance.
     *
     * @return array|JsonResponse
     */
    public function editAction(Request $request, Endorsement $endorsement)
    {
        $form = $this->createForm(new EndorsementType(), $endorsement);
        $form->handleRequest($request);

        if ($form->isValid()) {
            $this->getDoctrine()->getManager()->flush();

            return new JsonResponse(['reload' => true]);
        }

        return [
            'form' => $form->createView(),
            'action' => $this->generateUrl(
                'govwiki_admin_endorsement_edit',
                ['id' => $endorsement->getId()]
            ),
        ];
    }

    /**
     * @Configuration\Route("/endorsement/{id}/remove")
     *
     * @param Endorsement $endorsement A Endorsement instance.
     *
     * @return JsonResponse
     */
    public function removeAction(Endorsement $endorsement)
    {
        $em = $this->getDoctrine()->getManager();
        $em->remove($endorsement);
        $em->flush();

        return new JsonResponse(['status' => 'ok']);
    }
}
