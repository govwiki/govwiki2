<?php

namespace GovWiki\AdminBundle\Controller;

use CartoDbBundle\CartoDbServices;
use GovWiki\AdminBundle\GovWikiAdminServices;
use GovWiki\AdminBundle\Manager\AdminEnvironmentManager;
use GovWiki\DbBundle\Entity\Map;
use GovWiki\DbBundle\Form\MapType;
use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Class MapController
 * @package GovWiki\AdminBundle\Controller
 *
 * @Configuration\Route("/map")
 */
class MapController extends AbstractGovWikiAdminController
{
    /**
     * @Configuration\Route("/edit")
     * @Configuration\Template()
     *
     * @param Request $request A Request instance.
     *
     * @return array
     */
    public function editAction(Request $request)
    {
        /** @var AdminEnvironmentManager $manager */
        $manager = $this->get(GovWikiAdminServices::ADMIN_ENVIRONMENT_MANAGER);

        /** @var Map $map */
        $map = $manager->getMap();
        if (null === $map) {
            throw new NotFoundHttpException();
        }

        $form = $this->createForm(new MapType(), $map);

        $form->handleRequest($request);
        $form = $this->processForm($form);

        $isImported = null !== $map->getItemQueueId();
        if ($isImported) {
            $cartoDbApi = $this->get(CartoDbServices::CARTO_DB_API);
            /*
             * Governments data exported to CartoDB service.
             */
            $result = $cartoDbApi
                ->checkImportProcess($map->getItemQueueId());

            if (true === $result['success']) {
                $em = $this->getDoctrine()->getManager();
                if ('complete' === $result['state']) {
                    if (! $map->isCreated()) {
                        $map->setCreated(true);
                        $map->setVizUrl($cartoDbApi->getVizUrl($result));
                        $this->addFlash('admin_success', 'Map created');
                    } else {
                        $this->addFlash('admin_success', 'Map updated');
                    }
                    $map->setItemQueueId(null);
                    $em->persist($map);
                    $em->flush();
                    $isImported = false;
                } elseif ('failed' === $result['state']) {
                    $em->remove($map->getEnvironment());
                    $em->flush();
                    $this->addFlash(
                        'admin_error',
                        "Can't create map: ({$result['error_code']})".
                        "{$result['get_error_text']['what_about']}"
                    );
                }
            }
        }

        return [
            'form' => $form->createView(),
            'vizUrl' => $map->getVizUrl(),
            'canExport' => ! $isImported,
        ];
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
}
