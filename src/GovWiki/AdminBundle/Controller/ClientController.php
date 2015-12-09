<?php

namespace GovWiki\AdminBundle\Controller;

use GovWiki\OAuthBundle\Form\ClientType;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class ClientController
 * @package GovWiki\AdminBundle\Controller
 *
 * @Configuration\Route("/clients")
 */
class ClientController extends Controller
{
    /**
     * @Configuration\Route("/", name="client_list")
     * @Configuration\Template()
     *
     * @param Request $request A Request instance.
     *
     * @return array
     */
    public function listAction(Request $request)
    {
        return [
            'clients' => $this->get('knp_paginator')->paginate(
                $this->getDoctrine()
                    ->getRepository('GovWikiOAuthBundle:Client')
                    ->getListQuery(),
                $request->query->getInt('page', 1),
                10
            ),
        ];
    }

    /**
     * @Configuration\Route("/new", name="client_new")
     * @Configuration\Template()
     *
     * @param Request $request A Request instance.
     *
     * @return array
     */
    public function newAction(Request $request)
    {
        $client = $this->clientManager()->createClient();
        $client->setAllowedGrantTypes([
            'refresh_token',
            'password',
            'token',
            'client_credential'
        ]);
        $form = $this->createForm(new ClientType(), $client);

        $form->handleRequest($request);
        $form = $this->processForm($form);

        return [
            'form' => $form->createView(),
        ];
    }

    /**
     * @Configuration\Route("/{name}", name="client_edit")
     * @Configuration\Template()
     *
     * @param Request $request A Request instance.
     * @param string  $name    Client name.
     *
     * @return array
     */
    public function editAction(Request $request, $name)
    {
        $client = $this->clientManager()->findClientBy([ 'name' => $name ]);
        $form = $this->createForm(new ClientType(), $client);

        $form->handleRequest($request);
        $form = $this->processForm($form);

        return [
            'form' => $form->createView(),
            'name' => $name,
        ];
    }

    /**
     * @Configuration\Route("/{name}/delete", name="client_remove")
     *
     * @param string $name Client name.
     *
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function removeAction($name)
    {
        $manager = $this->clientManager();
        $client = $manager->findClientBy([ 'name' => $name ]);

        if (null !== $client) {
            $manager->deleteClient($client);
        }

        return $this->redirectToRoute('client_list');
    }

    /**
     * @param FormInterface $form A FormInterface instance.
     *
     * @return FormInterface
     */
    private function processForm(FormInterface $form)
    {
        if ($form->isSubmitted() && $form->isValid()) {
            $this->clientManager()->updateClient($form->getData());
        }

        return $form;
    }

    /**
     * @return \FOS\OAuthServerBundle\Entity\ClientManager
     */
    private function clientManager()
    {
        return $this->get('fos_oauth_server.client_manager.default');
    }
}
