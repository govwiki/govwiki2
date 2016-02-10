<?php

namespace GovWiki\AdminBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;

/**
 * Class LocalizationController
 * @package GovWiki\AdminBundle\Controller
 *
 * @Configuration\Route("/localization")
 */
class LocalizationController extends Controller
{
    /**
     * Show list of languages.
     *
     * @Configuration\Route("/", methods="GET")
     * @Configuration\Template()
     *
     * @return array
     *
     * @throws \LogicException Some required bundle not registered.
     */
    public function indexAction()
    {
        /*$l10ns = $this->paginate(
            $this->getManager()
                ->getListQuery($id, $name),
            $request->query->getInt('page', 1),
            50
        );*/

        return [ 'governments' => 'dfg' ];
    }
}
