<?php

namespace GovWiki\AdminBundle\Controller;

use GovWiki\DbBundle\Entity\Repository\ListedEntityRepositoryInterface;
use GovWiki\DbBundle\Entity\StaffEntityInterface;
use GovWiki\UserBundle\Entity\User;
use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;
use Symfony\Component\HttpFoundation\Request;
use GovWiki\DbBundle\Entity\ElectedOfficial;

/**
 * Class ElectedOfficialController
 * @package GovWiki\AdminBundle\Controller
 *
 * @Configuration\Route(
 *  "/{environment}/elected-official",
 *  requirements={ "environment": "\w+" }
 * )
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
        if ($this->getCurrentEnvironment() === null) {
            return $this->redirectToRoute('govwiki_admin_main_home');
        }

        $session = $this->container->get('session');
        $environment = $this->getCurrentEnvironment()->getSlug();

        $id = null;
        $fullName = null;
        $governmentName = null;

        $session_filter = $session->get('filter');
        if (!$session_filter) {
            $session_filter = [];
            $session_filter[$environment] = [
                'elected' => [
                    'id' => null,
                    'fullName' => null,
                    'governmentName' => null
                ],
                'government' => [
                    'id' => null,
                    'name' => null
                ]
            ];
        } elseif (!isset($session_filter[$environment])) {
            $session_filter[$environment] = [
                'elected' => [
                    'id' => null,
                    'fullName' => null,
                    'governmentName' => null
                ],
                'government' => [
                    'id' => null,
                    'name' => null
                ]
            ];
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

        $electedOfficials = $this->getDoctrine()
            ->getRepository('GovWikiDbBundle:ElectedOfficial')
            ->getListQuery(
                $this->getCurrentEnvironment()->getSlug(),
                $id,
                $fullName,
                $governmentName
            );
        $electedOfficials = $this->paginate(
            $electedOfficials,
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
        if ($this->getCurrentEnvironment() === null) {
            return $this->redirectToRoute('govwiki_admin_main_home');
        }

        /** @var ElectedOfficial $electedOfficial */
        $electedOfficial = new ElectedOfficial();

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
     * @Configuration\Route(
     *  "/{elected}/edit",
     *  requirements={"elected": "\d+"}
     * )
     * @Configuration\Template()
     *
     * @param Request         $request A Request instance.
     * @param ElectedOfficial $elected A ElectedOfficial entity instance.
     *
     * @return array
     */
    public function editAction(Request $request, ElectedOfficial $elected)
    {
        if ($this->getCurrentEnvironment() === null) {
            return $this->redirectToRoute('govwiki_admin_main_home');
        }

        $form = $this->createForm('govwiki_dbbundle_electedofficial', $elected);
        $form->handleRequest($request);

        if ($form->isValid()) {
            $this->getDoctrine()->getManager()->flush();
            $this->successMessage(
                'Elected official '. $elected->getFullName() .' updated'
            );

            return $this->redirectToRoute(
                'govwiki_admin_electedofficial_index',
                [ 'environment' => $this->getCurrentEnvironment()->getSlug() ]
            );
        }

        return [
            'form' => $form->createView(),
            'elected' => $elected,
        ];
    }

    /**
     * @Configuration\Route(
     *  "/{elected}/{staff}",
     *  requirements={
     *      "elected": "\d+",
     *      "staff": "\w+"
     *  }
     * )
     *
     * @param Request         $request A Request instance.
     * @param ElectedOfficial $elected A ElectedOfficial entity instance.
     * @param string          $staff   Vote, Contribution, Endorsements or
     *                                 PublicStatements.
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function staffAction(Request $request, ElectedOfficial $elected, $staff)
    {
        if ($this->getCurrentEnvironment() === null) {
            return $this->redirectToRoute('govwiki_admin_main_home');
        }

        /** @var User $user */
        $user = $this->getUser();

        $data = $this->getStaffRepository($staff)
            ->getListQuery($elected->getId(), $user->getId());
        $data = $this->paginate(
            $data,
            $request->query->get('page', 1),
            25
        );

        return $this->getStaffTemplate($staff, 'index', [
            'data' => $data,
            'elected' => $elected,
        ]);
    }

    /**
     * @Configuration\Route(
     *  "/{elected}/{staff}/new",
     *  requirements={
     *      "elected": "\d+",
     *      "staff": "\w+"
     *  }
     * )
     *
     * @param Request         $request A Request instance.
     * @param ElectedOfficial $elected A ElectedOfficial entity instance.
     * @param string          $staff   Vote, Contribution, Endorsements or
     *                                 PublicStatements.
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function staffCreateAction(
        Request $request,
        ElectedOfficial $elected,
        $staff
    ) {
        if ($this->getCurrentEnvironment() === null) {
            return $this->redirectToRoute('govwiki_admin_main_home');
        }

        $entityClassName = $this->getStaffRepository($staff)->getClassName();
        /** @var StaffEntityInterface $entity */
        $entity = new $entityClassName();
        $entity->setElectedOfficial($elected);

        $formType = $entity::getFormType();

        $form = $this->createForm($formType, $entity);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $em = $this->getDoctrine()->getManager();

            $em->persist($entity);
            $em->flush();

            $this->successMessage('New '. $staff .' created.');
            return $this->redirectToRoute('govwiki_admin_electedofficial_staff', [
                'environment' => $this->getCurrentEnvironment()->getSlug(),
                'elected' => $elected->getId(),
                'staff' => $staff,
            ]);
        }

        return $this->getStaffTemplate($staff, 'create', [
            'form' => $form->createView(),
            'elected' => $elected,
        ]);
    }

    /**
     * @Configuration\Route(
     *  "/{elected}/{staff}/{id}/edit",
     *  requirements={
     *      "elected": "\d+",
     *      "staff": "\w+",
     *      "id": "\d+"
     *  }
     * )
     *
     * @param Request         $request A Request instance.
     * @param ElectedOfficial $elected A ElectedOfficial entity instance.
     * @param string          $staff   Vote, Contribution, Endorsements or
     *                                 PublicStatements.
     * @param integer         $id      Edited entity id.
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function staffEditAction(
        Request $request,
        ElectedOfficial $elected,
        $staff,
        $id
    ) {
        if ($this->getCurrentEnvironment() === null) {
            return $this->redirectToRoute('govwiki_admin_main_home');
        }

        $entity = $this->getStaffRepository($staff)->getOne($id);

        $formType = $entity::getFormType();

        $form = $this->createForm($formType, $entity);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $em = $this->getDoctrine()->getManager();

            $em->persist($entity);
            $em->flush();

            $this->successMessage($staff .' '. $entity->getId() .'updated');
            return $this->redirectToRoute('govwiki_admin_electedofficial_staff', [
                'environment' => $this->getCurrentEnvironment()->getSlug(),
                'elected' => $elected->getId(),
                'staff' => $staff,
            ]);
        }

        return $this->getStaffTemplate($staff, 'edit', [
            'form' => $form->createView(),
            'elected' => $elected,
            'entity' => $entity,
        ]);
    }

    /**
     * @Configuration\Route(
     *  "/{elected}/{staff}/{id}/remove",
     *  requirements={
     *      "elected": "\d+",
     *      "staff": "\w+",
     *      "id": "\d+"
     *  }
     * )
     *
     * @param ElectedOfficial $elected A ElectedOfficial entity instance.
     * @param string          $staff   Vote, Contribution, Endorsements or
     *                                 PublicStatements.
     * @param integer         $id      Deleted staff id.
     *
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function staffRemoveAction(ElectedOfficial $elected, $staff, $id)
    {
        if ($this->getCurrentEnvironment() === null) {
            return $this->redirectToRoute('govwiki_admin_main_home');
        }

        $entityClassName = $this->getStaffRepository($staff)->getClassName();
        $em = $this->get('doctrine.orm.default_entity_manager');

        $entity = $em->getReference($entityClassName, $id);
        $em->remove($entity);
        $em->flush();

        return $this->redirectToRoute('govwiki_admin_electedofficial_staff', [
            'environment' => $this->getCurrentEnvironment()->getSlug(),
            'elected' => $elected->getId(),
            'staff' => $staff,
        ]);
    }

    /**
     * @param string $staff Vote, Contribution, Endorsements or PublicStatements.
     *
     * @return ListedEntityRepositoryInterface
     */
    private function getStaffRepository($staff)
    {
        // Legacy reason.
        $repositoryName = 'GovWikiDbBundle:'. $staff;
        if ($staff === 'Vote') {
            $repositoryName = 'GovWikiDbBundle:ElectedOfficial'. $staff;
        }

        return $this->getDoctrine()->getRepository($repositoryName);
    }

    /**
     * @param string $staff      Vote, Contribution, Endorsements or PublicStatements.
     * @param string $action     Index, create or edit.
     * @param array  $parameters Template parameters.
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    private function getStaffTemplate($staff, $action, $parameters = [])
    {
        $templatePath = 'ElectedOfficial/Partial/'. $staff;

        return $this->render('GovWikiAdminBundle:'. $templatePath .':'
            . $action .'.html.twig', $parameters);
    }
}
