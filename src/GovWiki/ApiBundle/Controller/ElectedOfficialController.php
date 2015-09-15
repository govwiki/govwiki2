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
     * @Route("/{govAltTypeSlug}/{govSlug}/{eoSlug}", methods="GET")
     *
     * @param  string $govAltTypeSlug
     * @param  string $govSlug
     * @param  string $eoSlug
     * @return Response
     */
    public function showElectedOfficialAction($govAltTypeSlug, $govSlug, $eoSlug)
    {
        $em = $this->getDoctrine()->getManager();

        $government = $em->getRepository('GovWikiDbBundle:Government')->findOneBy(['altTypeSlug' => $govAltTypeSlug, 'slug' => $govSlug]);
        $electedOfficial = $em->getRepository('GovWikiDbBundle:ElectedOfficial')->findBy(['government' => $government, 'slug' => $eoSlug]);

        $serializer = $this->get('jms_serializer');

        $response = new Response();
        $response->setContent($serializer->serialize($electedOfficial, 'json', SerializationContext::create()->enableMaxDepthChecks()));
        $response->headers->set('Content-Type', 'application/json');

        return $response;
    }
}
