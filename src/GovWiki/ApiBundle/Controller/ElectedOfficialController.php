<?php

namespace GovWiki\ApiBundle\Controller;

use GovWiki\DbBundle\Entity\ElectedOfficial;
use GovWiki\DbBundle\Entity\Repository\CreateRequestRepository;
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
        /** @var CreateRequestRepository $repository */
        $repository = $em->getRepository('GovWikiDbBundle:CreateRequest');

        $government = $em->getRepository('GovWikiDbBundle:Government')->findOneBy(['altTypeSlug' => $govAltTypeSlug, 'slug' => $govSlug]);
        /** @var ElectedOfficial $electedOfficial */
        $electedOfficial = $em->getRepository('GovWikiDbBundle:ElectedOfficial')->findOneBy(['government' => $government, 'slug' => $eoSlug]);

        $serializer = $this->get('jms_serializer');

        $response = new Response();
        $response->setContent($serializer->serialize(
            [
                'person' => $electedOfficial,
                'createRequests' => $repository->getCreateRequestFor($electedOfficial->getId()),
                'categories' => $em->getRepository('GovWikiDbBundle:IssueCategory')->findAll(),
            ],
            'json',
            SerializationContext::create()->enableMaxDepthChecks()
        ));
        $response->headers->set('Content-Type', 'application/json');

        return $response;
    }
}
