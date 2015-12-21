<?php

namespace GovWiki\AdminBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use GovWiki\DbBundle\Entity\ElectedOfficial;
use GovWiki\DbBundle\Entity\Contribution;
use GovWiki\DbBundle\Form\ContributionType;

/**
 * ContributionController all actions use xmlHttpRequest, and partials as
 * default template.
 *
 * @package GovWiki\AdminBundle\Controller
 */
class ContributionController extends AbstractGovWikiAdminController
{
    /**
     * @Configuration\Route(
     *  "/elected-official/{id}/contribution/create",
     *  requirements={"id": "\d+"}
     * )
     * @Configuration\Template("GovWikiAdminBundle:ElectedOfficial:_contribution_modal_form.html.twig")
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
        $contribution = new Contribution();

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
            'action' => $this->generateUrl(
                'govwiki_admin_contribution_create',
                ['id' => $electedOfficial->getId()]
            ),
        ];
    }

    /**
     * @Configuration\Route(
     *  "/contribution/{id}/edit",
     *  requirements={"id": "\d+"}
     * )
     * @Configuration\Template("GovWikiAdminBundle:ElectedOfficial:_contribution_modal_form.html.twig")
     *
     * @param Request      $request      A Request instance.
     * @param Contribution $contribution A Contribution instance.
     *
     * @return array|JsonResponse
     */
    public function editAction(Request $request, Contribution $contribution)
    {
        $form = $this->createForm(new ContributionType(), $contribution);
        $form->handleRequest($request);

        if ($form->isValid()) {
            $this->getDoctrine()->getManager()->flush();

            return new JsonResponse(['reload' => true]);
        }

        return [
            'form' => $form->createView(),
            'action' => $this->generateUrl(
                'govwiki_admin_contribution_edit',
                ['id' => $contribution->getId()]
            ),
        ];
    }

    /**
     * @Configuration\Route("/contribution/{id}/remove")
     *
     * @param Contribution $contribution A Contribution instance.
     *
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
