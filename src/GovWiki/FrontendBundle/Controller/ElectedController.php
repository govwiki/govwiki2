<?php

namespace GovWiki\FrontendBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\Security\Core\User\UserInterface;

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
    public function governmentAction($altTypeSlug, $slug)
    {

        $em = $this->getDoctrine()->getManager();

        $government = $em->getRepository('GovWikiDbBundle:ElectedOfficial')->findAll();

        $qb = $em->createQueryBuilder()->select('eo')->from('GovWikiDbBundle:ElectedOfficial', 'eo')
            ->leftJoin('eo.government', 'g')
            ->findOneBy(['altTypeSlug'=>$altTypeSlug, 'slug'=>$slug]);

        return ['government' => $government];
    }


}
