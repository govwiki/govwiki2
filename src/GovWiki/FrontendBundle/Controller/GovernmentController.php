<?php

namespace GovWiki\FrontendBundle\Controller;

use GovWiki\ApiBundle\GovWikiApiServices;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;

/**
 * MainController
 */
class GovernmentController extends Controller
{
    /**
     * @Route("/{altTypeSlug}/{slug}", name="government")
     * @Template("GovWikiFrontendBundle:Government:index.html.twig")
     *
     * @param string $altTypeSlug Slugged government alt type.
     * @param string $slug        Slugged government name.
     *
     * @return array
     */
    public function governmentAction($altTypeSlug, $slug)
    {
        return $this->get(GovWikiApiServices::ENVIRONMENT_MANAGER)
            ->getGovernment($altTypeSlug, $slug);
    }
}
