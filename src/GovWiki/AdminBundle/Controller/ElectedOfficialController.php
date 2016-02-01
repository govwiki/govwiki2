<?php

namespace GovWiki\AdminBundle\Controller;

use GovWiki\AdminBundle\GovWikiAdminServices;
use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;
use GovWiki\UserBundle\Entity\User;
use Symfony\Component\HttpFoundation\Request;
use GovWiki\DbBundle\Entity\ElectedOfficial;
use GovWiki\DbBundle\Form\ElectedOfficialLinkedUserType;

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
     * @Configuration\Route("/{id}/create_linked_user", requirements={"id": "\d+"})
     * @Configuration\Template()
     *
     * @param Request         $request         A Request instance.
     * @param ElectedOfficial $electedOfficial A ElectedOfficial instance.
     *
     * @return array
     */
    public function createLinkedUserAction(
        Request $request,
        ElectedOfficial $electedOfficial
    ) {
        $form = $this->createForm(new ElectedOfficialLinkedUserType(), array(
            'offered_username' => strtolower($electedOfficial->getSlug()),
            'offered_email' => $electedOfficial->getEmailAddress()
        ));
        $form->handleRequest($request);

        if ($form->isValid()) {
            $em = $this->getDoctrine()->getManager();
            $form_data = $form->getData();

            $new_user_username = $form_data['username'];
            $new_user_email = $form_data['email'];
            $new_user_password = $form_data['password'];

            $linked_user = new User();
            $linked_user->setUsername($new_user_username);
            $linked_user->setEmail($new_user_email);
            $linked_user->setPlainPassword($new_user_password);
            $linked_user->setEnabled(true);
            $linked_user->addRole('ROLE_ELECTED_OFFICIAL');

            $electedOfficial->setLinkedUser($linked_user);

            $em->persist($linked_user);
            $em->persist($electedOfficial);
            $em->flush();

            if ($form_data['send_notification_email']) {
                $messageToElectedOfficial = \Swift_Message::newInstance();
                if ($this->getParameter('debug')) {
                    $messageToElectedOfficial->setTo('user1@mail1.dev');
                } else {
                    $messageToElectedOfficial->setTo($new_user_email);
                }
                $messageToElectedOfficial
                    ->setSubject($this->getParameter('email_subject'))
                    ->setFrom($this->getParameter('admin_email'))
                    ->setBody(
                        $this->renderView(
                            'GovWikiAdminBundle:ElectedOfficial:emailToNewLinkedUser.html.twig',
                            array(
                                'full_name' => $electedOfficial->getFullName(),
                                'username' => $new_user_username,
                                'password' => $new_user_password
                            )
                        ),
                        'text/html'
                    );
                $this->container->get('mailer')->send($messageToElectedOfficial);
            }

            $this->addFlash('info', 'Linked user created');

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
