<?php

namespace GovWiki\AdminBundle\Controller;

use GovWiki\AdminBundle\GovWikiAdminServices;
use GovWiki\DbBundle\Entity\Map;
use GovWiki\DbBundle\Entity\Shape;
use GovWiki\DbBundle\Form\LegendRowType;
use GovWiki\DbBundle\Form\NewShapeType;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;

/**
 * Class LegendController
 * @package GovWiki\AdminBundle\Controller
 *
 * @Configuration\Route(
 *  "/{environment}/legend",
 *  requirements={ "environment": "\w+" }
 * )
 */
class LegendController extends AbstractGovWikiAdminController
{
    /**
     * @Configuration\Route("/")
     * @Configuration\Template()
     *
     * @param Request $request A Request instance.
     *
     * @return array
     *
     * @throws NotFoundHttpException Can't get map.
     * @throws \LogicException Some required bundle not registered.
     * @throws \InvalidArgumentException Invalid manager name.
     */
    public function editAction(Request $request)
    {
        $environment = $this->getCurrentEnvironment()->getSlug();

        /** @var Map $map */
        $map = $this->getCurrentEnvironment()->getMap();
        if (null === $map) {
            throw new NotFoundHttpException();
        }

        /*
         * Generate form for each available alt type.
         */
        $qb = $this->getDoctrine()->getRepository('GovWikiDbBundle:Government')
            ->createQueryBuilder('Government');
        $expr = $qb->expr();

        $altTypeList = $qb
            ->select('Government.county, Government.altTypeSlug')
            ->join('Government.environment', 'Environment')
            ->where($expr->eq('Environment.slug', $expr->literal($environment)))
            ->groupBy('Government.altTypeSlug')
            ->getQuery()
            ->getArrayResult();

        $data = $map->getLegend();
        $legend = [];
        foreach ($data as $row) {
            $altType = $row['altType'];
            unset($row['altType']);
            $legend[$altType] = $row;
        }

        $mainBuilder = $this->createFormBuilder($legend);
        foreach ($altTypeList as $altType) {
            $mainBuilder->add(
                $altType['altTypeSlug'],
                new LegendRowType($altType['county'])
            );
        }

        /*
         * Create main form.
         */
        $form = $mainBuilder->getForm();

        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            $em = $this->getDoctrine()->getManager();

            $data = $form->getData();
            $result = [];
            foreach ($data as $altType => $row) {
                $row['altType'] = $altType;
                $result[] = $row;
            }


            $map->setLegend($result);

            $em->persist($map);
            $em->flush();
        }

        return [ 'form' => $form->createView() ];
    }

    /**
     * @Configuration\Route("/shape")
     * @Configuration\Template()
     *
     * @param Request $request A Request instance.
     *
     * @return array
     *
     * @throws \LogicException Some required bundle not registered.
     */
    public function shapeAction(Request $request)
    {
        $shape = new Shape();
        $form = $this->createForm(new NewShapeType(), $shape, [
            'action' => $this->generateUrl('govwiki_admin_legend_shape', [
                'environment' => $this->getCurrentEnvironment()->getSlug(),
            ]),
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
