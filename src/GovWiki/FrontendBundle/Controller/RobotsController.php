<?php

namespace GovWiki\FrontendBundle\Controller;

use GovWiki\AdminBundle\Services\TxtSitemapGenerator;
use GovWiki\ApiBundle\GovWikiApiServices;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;

class RobotsController extends Controller
{
    /**
     * @Route("/robots.txt")
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

        $response->setContent(file_get_contents($path));

        return $response;
    }
}
