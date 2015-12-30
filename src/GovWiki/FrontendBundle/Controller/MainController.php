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
class MainController extends Controller
{
    /**
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function indexAction()
    {
        $qb = $this->getDoctrine()->getRepository('GovWikiDbBundle:Environment')
            ->createQueryBuilder('Environment');
        $expr = $qb->expr();

        $name = $qb
            ->select('Environment.slug')
            ->where(
                $expr->eq('Environment.enabled', 1)
            )
            ->setMaxResults(1)
            ->getQuery()
            ->getSingleScalarResult();

        return $this->redirectToRoute('map', [ 'environment' => $name ]);
    }

    /**
     * @Route("/", name="map")
     * @Template("GovWikiFrontendBundle:Main:map.html.twig")
     *
     * @return array
     */
    public function mapAction()
    {
        $environmentManager = $this->get(GovWikiApiServices::ENVIRONMENT_MANAGER);

        $environment = $environmentManager->getEnvironment();

        $map = $environmentManager->getMap();

        $context = new SerializationContext();
        $context->setGroups([ 'map' ]);
        $map = $this->get('jms_serializer')->serialize($map, 'json', $context);

        return [
            'environment' => $environment,
            'map' => $map,
            'greetingText' => $environmentManager->getGreetingText(),
        ];
    }
}
