<?php

namespace GovWiki\FrontendBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\Security\Core\User\UserInterface;

/**
 * MainController
 */
class MainController extends Controller
{
    /**
     * @Route("/")
     * @Template("GovWikiFrontendBundle:Home:home.html.twig")
     *
     * @return array
     */
    public function mapAction()
    {
        return $this->renderMainTemplate();
    }

    /**
     * @return array
     */
    private function renderMainTemplate()
    {
        /** @var UserInterface $user */
        $user = $this->getUser();
        $username = '';
        if (null !== $user) {
            $username = $user->getUsername();
        }

        $authorized = (null !== $user) ? 1 : 0;

        $this->get('twig')->addGlobal('authorized', $authorized);
        $this->get('twig')->addGlobal('username', $username);

        return [];
    }
}
