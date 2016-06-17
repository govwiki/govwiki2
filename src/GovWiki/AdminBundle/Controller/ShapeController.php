<?php

namespace GovWiki\AdminBundle\Controller;

use GovWiki\AdminBundle\GovWikiAdminServices;
use GovWiki\AdminBundle\Manager\AdminEnvironmentManager;
use GovWiki\DbBundle\Entity\Map;
use GovWiki\DbBundle\Entity\Shape;
use GovWiki\DbBundle\Form\LegendRowType;
use GovWiki\DbBundle\Form\NewShapeType;
use GovWiki\DbBundle\Form\Type\ShapeType;
use GovWiki\DbBundle\GovWikiDbServices;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;

/**
 * Class ShapeController
 * @package GovWiki\AdminBundle\Controller
 *
 * @Configuration\Route("/shape")
 */
class ShapeController extends Controller
{
    /**
     * @Configuration\Route("/")
     * @Configuration\Template()
     *
     * @param Request $request A Request instance.
     *
     * @return array
     *
     * @throws \LogicException Some required bundle not registered.
     */
    public function formAction(Request $request)
    {
        if ($this->getCurrentEnvironment() === null) {
            return $this->redirectToRoute('govwiki_admin_main_home');
        }

        $shape = new Shape();
        $form = $this->createForm(new NewShapeType(), $shape, [
            'action' => $this->generateUrl('govwiki_admin_shape_form'),
        ]);

        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            $manager = $this->get(GovWikiAdminServices::SHAPE_MANAGER);
            $em = $this->getDoctrine()->getManager();

            $manager->move($shape);

            $em->persist($shape);
            $em->flush();

            return new JsonResponse([
                'id' => $shape->getId(),
                'name' => $shape->getName(),
            ]);
        }

        return [ 'form' => $form->createView() ];
    }
}
