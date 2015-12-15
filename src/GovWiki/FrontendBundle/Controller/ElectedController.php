<?php

namespace GovWiki\FrontendBundle\Controller;

use GovWiki\ApiBundle\GovWikiApiServices;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;

/**
 * MainController
 */
class ElectedController extends Controller
{

    /**
     * @Route("/{altTypeSlug}/{slug}/{electedSlug}")
     * @Template("GovWikiFrontendBundle:Government:index.html.twig")
     *
     * @return array
     */
    public function showAction($altTypeSlug, $slug, $electedSlug)
    {
        return [
            'elected' => $this->get(GovWikiApiServices::ENVIRONMENT_MANAGER)
                ->getElectedOfficial($altTypeSlug, $slug, $electedSlug),
        ];
    }
}
