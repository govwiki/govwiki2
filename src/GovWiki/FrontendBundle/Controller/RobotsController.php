<?php

namespace GovWiki\FrontendBundle\Controller;

use GovWiki\AdminBundle\GovWikiAdminServices;
use GovWiki\AdminBundle\Services\TxtSitemapGenerator;
use GovWiki\EnvironmentBundle\Controller\AbstractGovWikiController;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\Response;

/**
 * Class RobotsController
 * @package GovWiki\FrontendBundle\Controller
 */
class RobotsController extends AbstractGovWikiController
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
        if ($this->getCurrentEnvironment() === null) {
            return new Response();
        }

        $response = new Response('text', 200, [
            'Content-Type: text/plain',
        ]);

        $environment = $this->getCurrentEnvironment()->getSlug();
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
