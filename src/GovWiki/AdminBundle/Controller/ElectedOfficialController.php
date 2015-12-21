<?php

namespace GovWiki\AdminBundle\Controller;

use GovWiki\AdminBundle\GovWikiAdminServices;
use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;
use Symfony\Component\HttpFoundation\Request;
use GovWiki\DbBundle\Entity\ElectedOfficial;
use GovWiki\DbBundle\Form\ElectedOfficialType;

/**
 * Class ElectedOfficialController
 * @package GovWiki\AdminBundle\Controller
 *
 * @Configuration\Route("/elected-official")
 */
class ElectedOfficialController extends AbstractGovWikiAdminController
{
    /**
     * List all elected official for this environment.
     *
     * @Configuration\Route("/", methods="GET")
     * @Configuration\Template()
     *
     * @param Request $request A Request instance.
     *
     * @return array
     */
    public function indexAction(Request $request)
    {
        $id = null;
        $fullName = null;
        $government = null;
        if ($filter = $request->query->get('filter')) {
            if (!empty($filter['id'])) {
                $id = (int) $filter['id'];
            }
            if (!empty($filter['fullName'])) {
                $fullName = $filter['fullName'];
            }
            if (!empty($filter['governmentName'])) {
                $government = $filter['governmentName'];
            }
        }

        $electedOfficials = $this->paginate(
            $this->getManager()->getListQuery($id, $fullName, $government),
            $request->query->getInt('page', 1),
            50
        );

        return [ 'electedOfficials' => $electedOfficials ];
    }

    /**
     * @Configuration\Route("/create")
     * @Configuration\Template()
     *
     * @param Request $request A Request instance.
     *
     * @return array
     */
    public function createAction(Request $request)
    {
        /** @var ElectedOfficial $electedOfficial */
        $electedOfficial = $this->getManager()->create();

        $form = $this->createForm(new ElectedOfficialType(), $electedOfficial);
        $form->handleRequest($request);

        if ($form->isValid()) {
            $em = $this->getDoctrine()->getManager();

            $em->persist($electedOfficial);
            $em->flush();
            $this->addFlash('admin_success', 'New elected official created');

            return $this->redirectToRoute(
                'govwiki_admin_electedofficial_index'
            );
        }

        return [ 'form' => $form->createView() ];
    }

    /**
     * @Configuration\Route("/{id}/edit", requirements={"id": "\d+"})
     * @Configuration\Template()
     *
     * @param Request         $request         A Request instance.
     * @param ElectedOfficial $electedOfficial A ElectedOfficial instance.
     *
     * @return array
     */
    public function editAction(
        Request $request,
        ElectedOfficial $electedOfficial
    ) {
        $form = $this->createForm(new ElectedOfficialType(), $electedOfficial);
        $form->handleRequest($request);

        if ($form->isValid()) {
            $this->getDoctrine()->getManager()->flush();
            $this->addFlash('info', 'Elected official updated');

            return $this->redirectToRoute(
                'govwiki_admin_electedofficial_index'
            );
        }

        return [
            'form' => $form->createView(),
            'electedOfficial' => $electedOfficial,
        ];
    }

    /**
     * @return \GovWiki\AdminBundle\Manager\Entity\AdminElectedOfficialManager
     */
    private function getManager()
    {
        return $this->get(GovWikiAdminServices::ELECTED_OFFICIAL_MANAGER);
    }
}
