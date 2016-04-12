<?php

namespace GovWiki\MobileBundle\Controller;

use GovWiki\ApiBundle\GovWikiApiServices;
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

    const ROWS_PER_PAGE = 15;

    /**
     * @Route("/{altTypeSlug}/{slug}/{electedSlug}", name="elected")
     * @Template("GovWikiMobileBundle:Elected:index.html.twig")
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
        $this->clearTranslationsCache();

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

        $data = array_merge($data, [
            'altTypeSlug' => $altTypeSlug,
            'slug' => $slug,
            'electedOfficialJSON' => $electedOfficialJSON,
            'electedOfficialCommentForm' => $electedOfficialCommentForm->createView()
        ]);

        $template = $request->query->get('template', 'index');

        return $this->render(
            "GovWikiMobileBundle:Elected:{$template}.html.twig",
            $data
        );
    }

    private function clearTranslationsCache()
    {
        $cacheDir = __DIR__ . "/../../../../app/cache";
        $finder = new \Symfony\Component\Finder\Finder();
        $finder->in(array($cacheDir . "/" . $this->container->getParameter('kernel.environment') . "/translations"))->files();
        foreach($finder as $file){
            unlink($file->getRealpath());
        }
    }
}
