<?php

namespace GovWiki\AdminBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use GovWiki\DbBundle\Entity\ElectedOfficial;
use GovWiki\DbBundle\Entity\Endorsement;
use GovWiki\DbBundle\Form\EndorsementType;

/**
 * EndorsementController all actions use xmlHttpRequest, and partials as default template
 */
class EndorsementController extends Controller
{
    /**
     * @Route("/electedofficial/{id}/endorsement/create", methods="GET|POST")
     * @Template("GovWikiAdminBundle:ElectedOfficial:_endorsement_modal_form.html.twig")
     *
     * @param Request         $request
     * @param ElectedOfficial $electedOfficial
     * @return Response|JsonResponse
     */
    public function createAction(Request $request, ElectedOfficial $electedOfficial)
    {
        $endorsement = new Endorsement;

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
            'action' => $this->generateUrl('govwiki_admin_endorsement_create', ['id' => $electedOfficial->getId()]),
        ];
    }

    /**
     * @Route("/endorsement/{id}/edit", methods="GET|POST", requirements={"id": "\d+"})
     * @Template("GovWikiAdminBundle:ElectedOfficial:_endorsement_modal_form.html.twig")
     *
     * @param Endorsement $endorsement
     * @param Request      $request
     * @return Response|JsonResponse
     */
    public function editAction(Endorsement $endorsement, Request $request)
    {
        $form = $this->createForm(new EndorsementType(), $endorsement);
        $form->handleRequest($request);

        if ($form->isValid()) {
            $this->getDoctrine()->getManager()->flush();

            return new JsonResponse(['reload' => true]);
        }

        return [
            'form' => $form->createView(),
            'action' => $this->generateUrl('govwiki_admin_endorsement_edit', ['id' => $endorsement->getId()]),
        ];
    }

    /**
     * @Route("/endorsement/{id}/remove")
     *
     * @param Endorsement $endorsement
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
