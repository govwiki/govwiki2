<?php

namespace GovWiki\AdminBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use GovWiki\DbBundle\Entity\ElectedOfficial;
use GovWiki\DbBundle\Entity\Contribution;
use GovWiki\DbBundle\Form\ContributionType;

/**
 * ContributionController all actions use xmlHttpRequest, and partials as default template
 */
class ContributionController extends Controller
{
    /**
     * @Route("/electedofficial/{id}/contribution/create", methods="GET|POST")
     * @Template("GovWikiAdminBundle:ElectedOfficial:_contribution_modal_form.html.twig")
     *
     * @param Request         $request
     * @param ElectedOfficial $electedOfficial
     * @return Response|JsonResponse
     */
    public function createAction(Request $request, ElectedOfficial $electedOfficial)
    {
        $contribution = new Contribution;

        $form = $this->createForm(new ContributionType(), $contribution);
        $form->handleRequest($request);

        if ($form->isValid()) {
            $em = $this->getDoctrine()->getManager();

            $contribution->setElectedOfficial($electedOfficial);
            $em->persist($contribution);
            $em->flush();

            return new JsonResponse(['reload' => true]);
        }

        return [
            'form'   => $form->createView(),
            'action' => $this->generateUrl('govwiki_admin_contribution_create', ['id' => $electedOfficial->getId()]),
        ];
    }

    /**
     * @Route("/contribution/{id}/edit", methods="GET|POST", requirements={"id": "\d+"})
     * @Template("GovWikiAdminBundle:ElectedOfficial:_contribution_modal_form.html.twig")
     *
     * @param Contribution $contribution
     * @param Request      $request
     * @return Response|JsonResponse
     */
    public function editAction(Contribution $contribution, Request $request)
    {
        $form = $this->createForm(new ContributionType(), $contribution);
        $form->handleRequest($request);

        if ($form->isValid()) {
            $this->getDoctrine()->getManager()->flush();

            return new JsonResponse(['reload' => true]);
        }

        return [
            'form' => $form->createView(),
            'action' => $this->generateUrl('govwiki_admin_contribution_edit', ['id' => $contribution->getId()]),
        ];
    }

    /**
     * @Route("/contribution/{id}/remove")
     *
     * @param Contribution $contribution
     * @return JsonResponse
     */
    public function removeAction(Contribution $contribution)
    {
        $em = $this->getDoctrine()->getManager();
        $em->remove($contribution);
        $em->flush();

        return new JsonResponse(['status' => 'ok']);
    }
}
