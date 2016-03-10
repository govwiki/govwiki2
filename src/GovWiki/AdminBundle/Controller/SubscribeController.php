<?php

namespace GovWiki\AdminBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class SubscribeController
 * @package GovWiki\AdminBundle\Controller
 *
 * @Configuration\Route(
 *  "/{government}/subscribe",
 *  requirements={ "governments": "\d+" }
 * )
 */
class SubscribeController extends AbstractGovWikiAdminController
{
    const MAX_PER_PAGE = 25;

    /**
     * @Configuration\Route("/")
     *
     * @param Request $request    A Request instance.
     * @param integer $government Government id.
     *
     * @return array
     */
    public function indexAction(Request $request, $government)
    {
        return [
            'subscribers' => $this->paginate(
                $this->getDoctrine()
                    ->getRepository('GovWikiUserBundle:User')
                    ->getGovernmentSubscribersQuery($government),
                $request->query->get('page', 1),
                self::MAX_PER_PAGE
            ),
        ];
    }
}
