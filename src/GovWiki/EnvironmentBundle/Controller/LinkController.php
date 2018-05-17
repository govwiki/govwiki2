<?php

namespace GovWiki\EnvironmentBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\RedirectResponse;

/**
 * Class LinkController
 *
 * @package GovWiki\EnvironmentBundle\Controller
 *
 * @Route("")
 */
class LinkController extends AbstractGovWikiController
{

    /**
     * @Route("/{url}", requirements={ "url": ".*" })
     *
     * @return RedirectResponse
     */
    public function redirectAction($url)
    {
        //
        // todo only for prototyping
        //
        if ($url === 'cafr') {
            return new RedirectResponse('http://govwiki.cloudapp.net');
        }

        throw $this->createNotFoundException();
    }
}
