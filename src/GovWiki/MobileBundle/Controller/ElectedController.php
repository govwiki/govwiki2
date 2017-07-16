<?php

namespace GovWiki\MobileBundle\Controller;

use GovWiki\DbBundle\Form\ElectedOfficialCommentType;
use GovWiki\EnvironmentBundle\Controller\AbstractGovWikiController;
use GovWiki\UserBundle\Entity\User;
use JMS\Serializer\SerializationContext;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class ElectedController
 * @package GovWiki\MobileBundle\Controller
 */
class ElectedController extends AbstractGovWikiController
{

    const ROWS_PER_PAGE = 15;

    /**
     * @Route("/{altTypeSlug}/{slug}/{electedSlug}", name="elected")
     * @Template("GovWikiMobileBundle:Elected:index.html.twig")
     *
     * @param Request $request     A Request instance.
     * @param string  $altTypeSlug Slugged government alt type.
     * @param string  $slug        Slugged government name.
     * @param string  $electedSlug Slugged elected official full name.
     *
     * @return array
     *
     * @throws \LogicException Some required bundle not registered.
     */
    public function showAction(Request $request, $altTypeSlug, $slug, $electedSlug)
    {
        $user = $this->getUser();

        if ($user instanceof User) {
            $user = $user->getId();
        } else {
            $user = null;
        }

        $data = $this->getElectedOfficialManager()
            ->getElectedOfficial(
                $this->getCurrentEnvironment(),
                $altTypeSlug,
                $slug,
                $electedSlug,
                $user
            );

        if (null === $data) {
            return $this->render('GovWikiMobileBundle:Elected:404.html.twig', [
                'altTypeSlug' => $altTypeSlug,
                'slug' => $slug,
            ]);
        }

        $paginator = $this->get('knp_paginator');

//        $data['votes'] = $paginator->paginate(
//            $data['votes'],
//            1,
//            self::ROWS_PER_PAGE
//        );

//        $data['contributions'] = $paginator->paginate(
//            $data['contributions'],
//            1,
//            self::ROWS_PER_PAGE
//        );

        $data['endorsements'] = $paginator->paginate(
            $data['endorsements'],
            1,
            self::ROWS_PER_PAGE
        );

//        $data['publicStatements'] = $paginator->paginate(
//            $data['publicStatements'],
//            1,
//            self::ROWS_PER_PAGE
//        );

        $data['surveyResponses'] = $paginator->paginate(
            $data['surveyResponses'],
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

        $electedOfficialCommentForm = $this->createForm(new ElectedOfficialCommentType(), [
            'current_text' => $data['electedOfficial']['electedOfficialComments'],
            'electedOfficialId' => $data['electedOfficial']['id'],
        ]);

        // Create bio form.
        $electedOfficial = $data['electedOfficial'];
        $bioChanges = $electedOfficial['bioChanges'];

        $bio = $electedOfficial['bio'];
        if ($bioChanges['changed'] && (($user !== null)
                && ($bioChanges['changedBy'] == $user))
        ) {
            $bio = $bioChanges['lastChanges'];
        }

        $bioForm = $this
            ->createFormBuilder([ 'bio' => $bio ], [
                'attr' => [ 'id' => 'bio-form' ],
            ])
            ->add('bio', 'ckeditor', [
                'config_name' => 'elected_official_bio',
                'label' => false,
            ])
            ->getForm();

        $data = array_merge($data, [
            'altTypeSlug' => $altTypeSlug,
            'slug' => $slug,
            'electedOfficialJSON' => $electedOfficialJSON,
            'electedOfficialCommentForm' => $electedOfficialCommentForm->createView(),
            'bioForm' => $bioForm->createView(),
        ]);

        return $data;
    }
}
