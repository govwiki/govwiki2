<?php

namespace GovWiki\FrontendBundle\Controller;

use GovWiki\ApiBundle\GovWikiApiServices;
use GovWiki\DbBundle\Entity\ElectedOfficial;
use GovWiki\DbBundle\Form\ElectedOfficialCommentType;
use JMS\Serializer\SerializationContext;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpFoundation\Request;

/**
 * MainController
 */
class ElectedController extends Controller
{

    const ROWS_PER_PAGE = 2;

    /**
     * @Route("/{altTypeSlug}/{slug}/{electedSlug}", name="elected")
     * @Template("GovWikiFrontendBundle:Elected:index.html.twig")
     *
     * @param string $altTypeSlug Slugged government alt type.
     * @param string $slug        Slugged government name.
     * @param string $electedSlug Slugged elected official full name.
     *
     * @return array
     *
     * @throws \LogicException Some required bundle not registered.
     */
    public function showAction($altTypeSlug, $slug, $electedSlug, Request $request)
    {
        $data = $this->get(GovWikiApiServices::ENVIRONMENT_MANAGER)
            ->getElectedOfficial($altTypeSlug, $slug, $electedSlug);

        if (null === $data) {
            return [];
        }

        $paginator = $this->get('knp_paginator');

        $data['votes'] = $paginator->paginate(
            $data['votes'],
            1,
            self::ROWS_PER_PAGE
        );

        $data['contributions'] = $paginator->paginate(
            $data['contributions'],
            1,
            self::ROWS_PER_PAGE
        );

        $data['endorsements'] = $paginator->paginate(
            $data['endorsements'],
            1,
            self::ROWS_PER_PAGE
        );

        $data['publicStatements'] = $paginator->paginate(
            $data['publicStatements'],
            1,
            self::ROWS_PER_PAGE
        );

        $context = new SerializationContext();
        $context->setGroups(['elected_official']);

        /*
         * Serialize elected official to json.
         */
        $electedOfficialJSON = $this->get('jms_serializer')
            ->serialize($data['electedOfficial'], 'json', $context);

        $electedOfficialCommentForm = $this->createForm(new ElectedOfficialCommentType(), array(
            'current_text' => $data['electedOfficial']['electedOfficialComments'],
            'electedOfficialId' => $data['electedOfficial']['id']
        ));

        return array_merge($data, [
            'altTypeSlug' => $altTypeSlug,
            'slug' => $slug,
            'electedOfficialJSON' => $electedOfficialJSON,
            'electedOfficialCommentForm' => $electedOfficialCommentForm->createView()
        ]);
    }

    /**
     * @Route("/elected_official_comments_edit", name="elected_official_comments_edit")
     *
     * @param Request $request A Request instance.
     */
    public function editElectedOfficialCommentAction(Request $request)
    {
        $em = $this->getDoctrine()->getManager();

        $form = new ElectedOfficialCommentType();
        $request_data = $request->get($form->getName());

        $elected_official_id = $request_data['electedOfficialId'];
        $elected_official_comment = $request_data['comment'];
        $elected_official = $em->getRepository('GovWikiDbBundle:ElectedOfficial')->find($elected_official_id);
        $elected_official->setElectedOfficialComments($elected_official_comment);
        $em->persist($elected_official);
        $em->flush();

        $environment = $this
            ->get(GovWikiApiServices::ENVIRONMENT_MANAGER)
            ->getEnvironment();
        $government = $elected_official->getGovernment();
        $gov_alt_type_slug = $government->getAltTypeSlug();
        $gov_slug = $government->getSlug();
        $elected_official_slug = $elected_official->getSlug();

        return $this->redirectToRoute('elected', array(
            'environment' => $environment,
            'altTypeSlug' => $gov_alt_type_slug,
            'slug' => $gov_slug,
            'electedSlug' => $elected_official_slug
        ));
    }
}
