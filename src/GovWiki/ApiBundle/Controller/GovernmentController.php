<?php

namespace GovWiki\ApiBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\Response;
use GovWiki\DbBundle\Entity\Government;
use JMS\Serializer\SerializationContext;

/**
 * GovernmentController
 */
class GovernmentController extends Controller
{
    /**
     * @Route("/{id}/", methods="GET", requirements={"id":"\d+"})
     *
     * @param  Government $government
     * @return Response
     */
    public function showAction(Government $government)
    {
        $serializer = $this->get('jms_serializer');

        $response = new Response();
        $response->setContent($serializer->serialize($government, 'json', SerializationContext::create()->enableMaxDepthChecks()));
        $response->headers->set('Content-Type', 'application/json');

        return $response;
    }
}
