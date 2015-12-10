<?php

namespace GovWiki\AdminBundle\Controller;

use GovWiki\AdminBundle\Utils\GeoJsonFormater;
use GovWiki\ApiBundle\Controller\AbstractGovWikiController;
use GovWiki\DbBundle\Entity\Map;
use GovWiki\DbBundle\Form\MapType;
use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class MapController
 * @package GovWiki\AdminBundle\Controller
 *
 * @Configuration\Route("/map")
 */
class MapController extends AbstractGovWikiController
{
    /**
     * @Configuration\Route("/", name="map_list")
     * @Configuration\Template()
     *
     * @param Request $request A Request instance.
     *
     * @return array
     */
    public function listAction(Request $request)
    {
        return [
            'maps' => $this->get('knp_paginator')->paginate(
                $this->repository()->listQuery(),
                $request->query->getInt('page', 1),
                10
            ),
        ];
    }

    /**
     * @Configuration\Route("/{name}", name="map_show")
     * @Configuration\Template()
     *
     * @param Request $request A Request instance.
     * @param string  $name    Map name.
     *
     * @return array
     */
    public function editAction(Request $request, $name)
    {
        /** @var Map $map */
        $map = $this->repository()->findOneBy([ 'name' => $name ]);
        $form = $this->createForm(new MapType(), $map);

        $form->handleRequest($request);
        $form = $this->processForm($form);

        $isImported = null !== $map->getItemQueueId();
        if ($isImported) {
            $result = $this->get('govwiki_admin.carto_db.api')
                ->checkImportProcess($map->getItemQueueId());

            if ((true === $result['success']) ||
                ('failure' === $result['state'])) {
                $map->setItemQueueId(null);
                $em = $this->getDoctrine()->getManager();
                $em->persist($map);
                $em->flush();
                $isImported = false;
            }
        }

        return [
            'form' => $form->createView(),
            'name' => $name,
            'canExport' => ! $isImported,
        ];
    }

    /**
     * @Configuration\Route("/new", name="map_new")
     * @Configuration\Template()
     *
     * @param Request $request A Request instance.
     *
     * @return array
     */
    public function newAction(Request $request)
    {
        $map = new Map();
        $form = $this->createForm(new MapType(), $map);

        $form->handleRequest($request);
        $form = $this->processForm($form);

        return [
            'form' => $form->createView(),
        ];
    }

    /**
     * @Configuration\Route("/{name}/export", name="map_export")
     *
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function exportToCartoDBAction($name)
    {
        $filepath = $this->getParameter('kernel.logs_dir'). "/$name.json";
        /** @var Map $map */
        $map = $this->repository()
            ->findOneBy([ 'name' => $name ]);

        if (null === $map->getItemQueueId()) {
            file_put_contents(
                $filepath,
                GeoJsonFormater::format(
                    $this->getDoctrine()
                        ->getRepository('GovWikiDbBundle:Government')
                        ->exportGovernments($name)
                )
            );

            $result = $this->get('govwiki_admin.carto_db.api')
                ->importDataset(realpath($filepath));
            unlink($filepath);

            $map->setItemQueueId($result['item_queue_id']);
            $em = $this->getDoctrine()->getManager();
            $em->persist($map);
            $em->flush();
        }

        return $this->redirectToRoute('map_show', [
            'name' => $name,
        ]);
    }

    /**
     * @param FormInterface $form A FormInterface instance.
     *
     * @return FormInterface
     */
    private function processForm(FormInterface $form)
    {
        if ($form->isSubmitted() && $form->isValid()) {
            $em = $this->getDoctrine()->getManager();
            $em->persist($form->getData());
            $em->flush();
        }

        return $form;
    }

    /**
     * @return \GovWiki\DbBundle\Entity\Repository\MapRepository
     */
    private function repository()
    {
        return $this->getDoctrine()->getRepository('GovWikiDbBundle:Map');
    }
}
