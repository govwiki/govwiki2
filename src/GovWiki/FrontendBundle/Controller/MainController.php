<?php

namespace GovWiki\FrontendBundle\Controller;

use GovWiki\ApiBundle\GovWikiApiServices;
use GovWiki\DbBundle\Doctrine\Type\ColorizedCountyCondition\ColorizedCountyConditions;
use JMS\Serializer\SerializationContext;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

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
        /** @var ColorizedCountyConditions $colorizedCountyConditions */
        $colorizedCountyConditions = $map['colorizedCountyConditions'];
        $map['colorizedCountyConditions'] = $colorizedCountyConditions
            ->toArray();

        $mapEntity = $map;
        if (null === $map) {
            throw new NotFoundHttpException();
        }
        $map['username'] = $this->getParameter('carto_db.account');

        $map = str_replace(
            [ '\'', '\\"' ],
            [ '&apos;', '&quote;' ],
            json_encode($map)
        );

//        $context = new SerializationContext();
//        $context->setGroups([ 'map' ]);
//        $map = $this->get('jms_serializer')->serialize($map, 'json', $context);

        return [
            'environment' => $environment,
            'map' => $map,
            'mapEntity' => $mapEntity,
            'greetingText' => $environmentManager->getGreetingText(),
        ];
    }
}
