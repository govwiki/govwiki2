<?php

namespace GovWiki\OAuthBundle\Controller;

use \FOS\OAuthServerBundle\Controller\AuthorizeController as BaseClass;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class AuthorizeController
 * @package GovWiki\OAuthBundle\Controller
 */
class AuthorizeController extends BaseClass
{
    /**
     * {@inheritdoc}
     */
    public function authorizeAction(Request $request)
    {
        return parent::authorizeAction($request);
    }
}
