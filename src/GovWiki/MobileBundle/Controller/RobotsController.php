<?php

namespace GovWiki\MobileBundle\Controller;

use GovWiki\AdminBundle\GovWikiAdminServices;
use GovWiki\AdminBundle\Services\TxtSitemapGenerator;
use GovWiki\ApiBundle\GovWikiApiServices;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;

/**
 * Class RobotsController
 * @package GovWiki\MobileBundle\Controller
 */
class RobotsController extends Controller
{
    /**
     * @Route("/robots.txt")
     *
     * @return Response
     *
     * @throws \InvalidArgumentException Invalid HTTP status code.
     * @throws \UnexpectedValueException Invalid response content.
     */
    public function robotsAction()
    {
        $response = new Response('text', 200, [
            'Content-Type: text/plain',
        ]);

        $environment = $this->get(GovWikiApiServices::ENVIRONMENT_MANAGER)
            ->getSlug();

        $robotsTxtName = TxtSitemapGenerator::getRobotsTxtName($environment);
        $path = $this->getParameter('kernel.root_dir') .'/../web/'.
            $robotsTxtName;

        if (! file_exists($path)) {
            $this->get(GovWikiAdminServices::TXT_SITEMAP_GENERATOR)
                ->generate($environment);
        }

        $response->setContent(file_get_contents($path));

        return $response;
    }
}
