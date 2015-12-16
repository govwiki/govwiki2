<?php

namespace GovWiki\AdminBundle\Controller;

use CartoDbBundle\CartoDbServices;
use CartoDbBundle\Service\CartoDbApi;
use GovWiki\AdminBundle\GovWikiAdminServices;
use GovWiki\AdminBundle\Manager\AdminEnvironmentManager;
use GovWiki\DbBundle\Entity\Environment;
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
class MapController extends AbstractGovWikiAdminController
{
    /**
     * @Configuration\Route("/")
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
            return $this->forward('GovWikiAdminBundle:Map:new', [
                'environment' => $manager->getEnvironment(),
            ]);
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
     * Here it is forwarded from the {@see MainController::newAction}.
     * Set up map parameters and import county or municipals GeoJson file to
     * CartoDB server.
     *
     * @Configuration\Route("/{environment}/new", methods={"POST"})
     * @Configuration\Template()
     *
     * @param Request            $request     A Request instance.
     * @param Environment|string $environment A Environment instance or
     *                                        environment name.
     *
     * @return array
     */
    public function newAction(Request $request, $environment)
    {
        if ($environment instanceof Environment) {
            $environmentObj = $environment;
            $environment = $environment->getName();
        } else {
            $environmentObj = $this->getDoctrine()
                ->getRepository('GovWikiDbBundle:Environment')
                ->getReferenceByName($environment);
            if (null === $environmentObj) {
                throw $this->createNotFoundException(
                    "Environment with name '$environment' not found"
                );
            }
        }

        $map = new Map();
        $map->setEnvironment($environmentObj);

        $form = $this->createForm(new MapType(true), $map);

        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            $em = $this->getDoctrine()->getManager();

            /** @var CartoDbApi $cartoDbApi */
            $cartoDbApi = $this->get(CartoDbServices::CARTO_DB_API);
            /*
             * Upload county dataset to CartoDB.
             */
            $file = $map->getCountyFile();
            $file->move($this->getParameter('kernel.logs_dir'), "{$environment}_county.json");
            $file = $this->getParameter('kernel.logs_dir'). "/{$environment}_county.json";
            $itemQueueId = $cartoDbApi->importDataset($file, true);
            unlink($file);

            $map->setItemQueueId($itemQueueId);
            $em->persist($map);
            $em->flush();

            return $this->redirectToRoute('govwiki_admin_map_edit', [
                'environment' => $environment,
            ]);
        }

        return [
            'form' => $form->createView(),
            'environment' => $environment,
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
