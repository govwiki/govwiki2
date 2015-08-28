<?php

namespace GovWiki\ApiBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Serializer\Serializer;
use Symfony\Component\Serializer\Encoder\JsonEncoder;
use Symfony\Component\Serializer\Normalizer\ObjectNormalizer;
use GovWiki\DbBundle\Entity\Government;
use GovWiki\DbBundle\Entity\ElectedOfficial;

/**
 * GovernmentController
 */
class GovernmentController extends Controller
{
    /**
     * @Route("/{slug}/", methods="GET")
     *
     * @param  Government $government
     * @return Response
     */
    public function showAction(Government $government)
    {
        $normalizer  = new ObjectNormalizer();
        $normalizer->setCircularReferenceHandler(function ($object) {
            return;
        });

        $serializer  = new Serializer([$normalizer], [new JsonEncoder()]);

        $response = new Response();
        $response->setContent($serializer->serialize($government, 'json'));
        $response->headers->set('Content-Type', 'application/json');

        return $response;
    }
}
