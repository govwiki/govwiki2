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
     * @Template("GovWikiFrontendBundle:Main:legacy.html.php")
     *
     * @return array
     */
    public function mapAction()
    {
        return $this->renderMainTemplate();
    }

    /**
     * @Route("/{altTypeSlug}/{slug}")
     * @Template("GovWikiFrontendBundle:Main:legacy.html.php")
     *
     * @return array
     */
    public function governmentAction()
    {
        return $this->renderMainTemplate();
    }

    /**
     * @Route("/rank_order")
     * @Template("GovWikiFrontendBundle:Main:legacy.html.php")
     *
     * @return array
     */
    public function rankOrderAction()
    {
        return $this->renderMainTemplate();
    }

    /**
     * @Route("/{govAltTypeSlug}/{govSlug}/{eoSlug}")
     * @Template("GovWikiFrontendBundle:Main:legacy.html.php")
     *
     * @return array
     */
    public function electedOfficialAction()
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
        return [
            'authorized' => (null !== $user) ? 1 : 0,
            'username' => $username,
        ];
    }
}
