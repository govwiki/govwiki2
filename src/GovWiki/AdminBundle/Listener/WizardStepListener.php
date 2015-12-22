<?php

namespace GovWiki\AdminBundle\Listener;

use GovWiki\AdminBundle\Controller\WizardController;
use Symfony\Component\HttpFoundation\Session\Session;
use Symfony\Component\HttpKernel\Event\FilterControllerEvent;

/**
 * Class WizardStepListener
 * @package GovWiki\AdminBundle\Listener
 */
class WizardStepListener
{
    /**
     * @var Session
     */
    private $session;

    /**
     * @param Session $session A Session instance.
     */
    public function __construct(Session $session)
    {
        $this->session = $session;
    }

    /**
     * @param FilterControllerEvent $event A FilterControllerEvent instance.
     *
     * @return void
     */
    public function onKernelController(FilterControllerEvent $event)
    {
        $controller = $event->getController();
        if (is_array($controller) && ($controller[0] instanceof WizardController)) {
            $step = WizardController::getStepByRoute
                ($event->getRequest()->attributes->get('_route'));
            if (is_int($step)) {
                $this->session->set(WizardController::WIZARD_STEP, $step);
            }
        }
    }
}
