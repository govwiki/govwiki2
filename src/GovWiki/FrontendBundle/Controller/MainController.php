<?php

namespace GovWiki\FrontendBundle\Controller;

use GovWiki\ApiBundle\GovWikiApiServices;
use GovWiki\DbBundle\Doctrine\Type\ColorizedCountyCondition\ColorizedCountyConditions;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Translation\MessageCatalogue;

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
                $expr->eq('Environment.slug', $expr->literal('puerto_rico'))
            )
            ->orderBy($expr->desc('Environment.id'))
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
        $this->clearTranslationsCache();

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

        $map = json_encode($map);

        /** @var MessageCatalogue $catalogue */
        $translator = $this->get('translator');
        $catalogue = $translator->getCatalogue();
        $transKey = 'map.greeting_text';
        if ($catalogue->has($transKey)) {
            $greetingText = $translator->trans($transKey);
        } else {
            $greetingText = '';
        }

        return [
            'environment' => $environment,
            'map' => $map,
            'mapEntity' => $mapEntity,
            'greetingText' => $greetingText
        ];
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
