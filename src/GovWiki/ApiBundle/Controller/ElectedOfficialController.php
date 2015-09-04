<?php

namespace GovWiki\ApiBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\Response;
use JMS\Serializer\SerializationContext;

/**
 * ElectedOfficialController
 */
class ElectedOfficialController extends Controller
{
    /**
     * @Route("/{gov_alt_type_slug}/{gov_slug}/{eo_slug}", methods="GET")
     *
     * @param  string $gov_alt_type_slug
     * @param  string $gov_slug
     * @param  string $eo_slug
     * @return Response
     */
    public function showElectedOfficialAction($gov_alt_type_slug, $gov_slug, $eo_slug)
    {
        $em = $this->getDoctrine()->getManager();

        $government = $em->getRepository('GovWikiDbBundle:Government')->findOneBy(['altTypeSlug' => $gov_alt_type_slug, 'slug' => $gov_slug]);
        $electedOfficial = $em->getRepository('GovWikiDbBundle:ElectedOfficial')->findBy(['government' => $government, 'slug' => $eo_slug]);

        $serializer = $this->get('jms_serializer');

        $response = new Response();
        $response->setContent($serializer->serialize($electedOfficial, 'json', SerializationContext::create()->enableMaxDepthChecks()));
        $response->headers->set('Content-Type', 'application/json');

        return $response;
    }
}
