<?php

namespace GovWiki\ApiBundle\Controller\V1;

use GovWiki\UserBundle\Entity\User;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Class TwilioSmsController
 * @package GovWiki\ApiBundle\Controller
 *
 * @Route("/sms")
 */
class TwilioSmsController extends Controller
{
    /**
     * Receive incoming sms messages.
     *
     * @param Request $request
     *
     * @Route(path="/receive")
     *
     * @return JsonResponse
     */
    public function receiveAction(Request $request)
    {
        //error_log('Request count = ' . count($request->request));
        //error_log('Sms from = ' . $request->request->get('from'));

        foreach ($request->request as $key => $val) {
            error_log('Sms key = ' . $key);
            error_log('Sms val = ' . $val);
        }

        return new Response();
    }
}
