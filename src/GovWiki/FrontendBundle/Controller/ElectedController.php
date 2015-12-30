<?php

namespace GovWiki\FrontendBundle\Controller;

use GovWiki\ApiBundle\GovWikiApiServices;
use JMS\Serializer\SerializationContext;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;

/**
 * MainController
 */
class ElectedController extends Controller
{

    /**
     * @Route("/{altTypeSlug}/{slug}/{electedSlug}", name="elected")
     * @Template("GovWikiFrontendBundle:Elected:index.html.twig")
     *
     * @param string $altTypeSlug Slugged government alt type.
     * @param string $slug        Slugged government name.
     * @param string $electedSlug Slugged elected official full name.
     *
     * @return array
     */
    public function showAction($altTypeSlug, $slug, $electedSlug)
    {
        $data = $this->get(GovWikiApiServices::ENVIRONMENT_MANAGER)
            ->getElectedOfficial($altTypeSlug, $slug, $electedSlug);

        $context = new SerializationContext();
        $context->setGroups(['elected_official']);

        /*
         * Serialize elected official to json.
         */
        $electedOfficialJSON = $this->get('jms_serializer')
            ->serialize($data['electedOfficial'], 'json', $context);
        /*
         * Replace single and double quote to html special char.
         */
        $electedOfficialJSON = str_replace(
            [ '\'', '\\"' ],
            [ '&apos;', '&quote;' ],
            $electedOfficialJSON
        );

        return array_merge($data, [
            'altTypeSlug' => $altTypeSlug,
            'slug' => $slug,
            'electedOfficialJSON' => $electedOfficialJSON,
        ]);
    }
}
