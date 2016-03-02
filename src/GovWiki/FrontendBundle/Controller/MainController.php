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
        $map['colorizedCountyConditions']['field_mask'] = '0.00%';
//        $map['colorizedCountyConditions']['field_mask'] = $environmentManager
//                ->getFieldFormat($colorizedCountyConditions->getFieldName())['mask'];

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
            $greetingText = '<div class="title"><h3>Welcome to California Policy Center&rsquo;s Civic Performance Profiles</h3></div><div class="content"><p>Is your local government giving you value for money? Use CPC&rsquo;s Civic Performance Profiles to see how your city, county, school district or special district stacks up.</p><p>Among the surprising facts we learned while compiling this database:</p><ul><li><a href="County/Los_Angeles">Los Angeles County</a> has unfunded retiree health liabilities of $26.7 billion.</li>	<li>Median full time public employee salary and benefits in <a href="/City/San_Jose">San Jose</a> exceeds $157,000.</li>	<li>The Superintendent of <a href="/School_District/New_Haven_Unified_School_District">New Haven Unified School District</a> in Alameda County received almost $650,000 in salary and benefits while the district&rsquo;s Academic Performance Index is below the state median.</li></ul><p>To learn more about a California local government that affects you, please select it from the map or by typing its name.</p></div>';
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
