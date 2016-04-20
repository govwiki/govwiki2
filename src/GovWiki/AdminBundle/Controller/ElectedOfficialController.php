<?php

namespace GovWiki\AdminBundle\Controller;

use GovWiki\AdminBundle\GovWikiAdminServices;
use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;
use Symfony\Component\HttpFoundation\Request;
use GovWiki\DbBundle\Entity\ElectedOfficial;

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
        $session = $this->container->get('session');
        $environment = $this->getCurrentEnvironment()->getSlug();

        $id = null;
        $fullName = null;
        $governmentName = null;

        $session_filter = $session->get('filter');
        if (!$session_filter) {
            $session_filter = array();
            $session_filter[$environment] = array(
                'elected' => array(
                    'id' => null,
                    'fullName' => null,
                    'governmentName' => null
                ),
                'government' => array(
                    'id' => null,
                    'name' => null
                )
            );
        } elseif (!isset($session_filter[$environment])) {
            $session_filter[$environment] = array(
                'elected' => array(
                    'id' => null,
                    'fullName' => null,
                    'governmentName' => null
                ),
                'government' => array(
                    'id' => null,
                    'name' => null
                )
            );
        } else {
            $id = $session_filter[$environment]['elected']['id'];
            $fullName = $session_filter[$environment]['elected']['fullName'];
            $governmentName = $session_filter[$environment]['elected']['governmentName'];
        }

        if ($filter = $request->query->get('filter')) {
            if (!empty($filter['id'])) {
                $id = (int) $filter['id'];
                $session_filter[$environment]['elected']['id'] = $id;
            } else {
                $id = null;
                $session_filter[$environment]['elected']['id'] = null;
            }
            if (!empty($filter['fullName'])) {
                $fullName = $filter['fullName'];
                $session_filter[$environment]['elected']['fullName'] = $fullName;
            } else {
                $fullName = null;
                $session_filter[$environment]['elected']['fullName'] = null;
            }
            if (!empty($filter['governmentName'])) {
                $governmentName = $filter['governmentName'];
                $session_filter[$environment]['elected']['governmentName'] = $governmentName;
            } else {
                $governmentName = null;
                $session_filter[$environment]['elected']['governmentName'] = null;
            }
            $session->set('filter', $session_filter);
        }

        $electedOfficials = $this->paginate(
            $this->getManager()->getListQuery($id, $fullName, $governmentName),
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

        $form = $this->createForm('govwiki_dbbundle_electedofficial', $electedOfficial);
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
        $form = $this->createForm('govwiki_dbbundle_electedofficial', $electedOfficial);
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
