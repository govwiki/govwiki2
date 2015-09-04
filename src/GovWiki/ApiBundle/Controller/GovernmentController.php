<?php

namespace GovWiki\ApiBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\Response;
use JMS\Serializer\SerializationContext;

/**
 * GovernmentController
 */
class GovernmentController extends Controller
{
    /**
     * @Route("/{alt_type_slug}/{slug}", methods="GET")
     *
     * @param  string $alt_type_slug
     * @param  string $slug
     * @return Response
     */
    public function showAction($alt_type_slug, $slug)
    {
        $em = $this->getDoctrine()->getManager();

        $government = $em->getRepository('GovWikiDbBundle:Government')->findOneBy(['altTypeSlug' => $alt_type_slug, 'slug' => $slug]);

        $serializer = $this->get('jms_serializer');

        $response = new Response();
        $response->setContent($serializer->serialize($government, 'json', SerializationContext::create()->enableMaxDepthChecks()));
        $response->headers->set('Content-Type', 'application/json');

        return $response;
    }
}
