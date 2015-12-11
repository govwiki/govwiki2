<?php

namespace GovWiki\AdminBundle\Controller;

use CartoDbBundle\CartoDbServices;
use CartoDbBundle\Service\CartoDbApi;
use GovWiki\AdminBundle\Utils\GeoJsonFormater;
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
 * @Configuration\Route("/{environment}/map")
 */
class MapController extends AbstractGovWikiAdminController
{
    /**
     * @Configuration\Route("/")
     * @Configuration\Template()
     *
     * @param Request $request     A Request instance.
     * @param string  $environment Environment name.
     *
     * @return array
     */
    public function editAction(Request $request, $environment)
    {
        /** @var Map $map */
        $map = $this->repository()->getByEnvironment($environment);
        if (null === $map) {
            throw $this->createNotFoundException(
                "Map for environment $environment not found"
            );
        }
        $form = $this->createForm(new MapType(), $map);

        $form->handleRequest($request);
        $form = $this->processForm($form);

        $isImported = null !== $map->getItemQueueId();
        if ($isImported) {
            /*
             * Governments data is now exported to CartoDB service.
             */
            $result = $this->get(CartoDbServices::CARTO_DB_API)
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
            'environment' => $environment,
            'canExport' => ! $isImported,
        ];
    }

    /**
     * Here it is forwarded from the {@see MainController::newAction}.
     *
     * @Configuration\Route("/new", methods={"POST"})
     * @Configuration\Template()
     *
     * @param Request $request     A Request instance.
     * @param string  $environment Environment name.
     *
     * @return array
     */
    public function newAction(Request $request, $environment)
    {
        $environmentObj = $this->getDoctrine()
            ->getRepository('GovWikiDbBundle:Environment')
            ->getReferenceByName($environment);

        $map = new Map();
        $map->setEnvironment($environmentObj);

        $form = $this->createForm(new MapType(), $map);

        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            $em = $this->getDoctrine()->getManager();

            /** @var CartoDbApi $cartoDbApi */
            $cartoDbApi = $this->get(CartoDbServices::CARTO_DB_API);
            /*
             * Upload county dataset to CartoDB.
             */
            $file = $map->getCountyFile();
            $itemQueueId = $cartoDbApi->importDataset(
                $file->getPath() .'/'. $file->getFilename()
            );

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
     * @Configuration\Route("/{name}/export")
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
