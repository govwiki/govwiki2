<?php

namespace GovWiki\ApiBundle\Listener;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\FilterResponseEvent;
use Symfony\Component\HttpKernel\Event\GetResponseEvent;

class CorsListener
{
    /**
     * @param GetResponseEvent $event
     */
    public function onKernelRequest(GetResponseEvent $event)
    {
        $request = $event->getRequest();

        if ($request->headers->has('Access-Control-Request-Headers') and $request->headers->has('Access-Control-Request-Method')) {

            $response = new Response();
            $response->headers->add([
                'Access-Control-Allow-Headers' => $request->headers->get('Access-Control-Request-Headers'),
                'Access-Control-Allow-Methods' => $request->headers->get('Access-Control-Request-Method'),
                'Access-Control-Allow-Origin'  => '*',
            ]);
            $event->setResponse($response);
            $event->stopPropagation();
        }
    }

    /**
     * @param FilterResponseEvent $event
     */
    public function onKernelResponse(FilterResponseEvent $event)
    {
        $response = $event->getResponse();
        $request  = $event->getRequest();

        if ($request->headers->has('Accept') and strstr($request->headers->get('Accept'), 'application/json')) {
            $response->headers->add(['Access-Control-Allow-Origin' => '*']);
        }
    }
}
