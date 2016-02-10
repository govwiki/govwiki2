<?php

namespace GovWiki\AdminBundle\Controller;

use CartoDbBundle\CartoDbServices;
use GovWiki\AdminBundle\GovWikiAdminServices;
use GovWiki\DbBundle\Form\ExtGovernmentType;
use GovWiki\DbBundle\GovWikiDbServices;
use GovWiki\DbBundle\Reader\CsvReader;
use GovWiki\DbBundle\Writer\CsvWriter;
use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\Request;
use GovWiki\DbBundle\Entity\Government;
use Symfony\Component\HttpFoundation\Response;

/**
 * Class GovernmentController
 * @package GovWiki\AdminBundle\Controller
 *
 * @Configuration\Route("/government")
 */
class GovernmentController extends AbstractGovWikiAdminController
{
    /**
     * Show list of governments for current environment.
     *
     * @Configuration\Route("/", methods="GET")
     * @Configuration\Template()
     *
     * @param Request $request A Request instance.
     *
     * @return array
     *
     * @throws \LogicException Some required bundle not registered.
     */
    public function indexAction(Request $request)
    {
        $id = null;
        $name = null;
        if ($filter = $request->query->get('filter')) {
            if (!empty($filter['id'])) {
                $id = (int) $filter['id'];
            }
            if (!empty($filter['name'])) {
                $name = $filter['name'];
            }
        }

        $governments = $this->paginate(
            $this->getManager()
                ->getListQuery($id, $name),
            $request->query->getInt('page', 1),
            50
        );

        return [ 'governments' => $governments ];
    }

    /**
     * Create new government in current environment.
     *
     * @Configuration\Route("/create")
     * @Configuration\Template()
     *
     * @param Request $request A Request instance.
     *
     * @return array
     *
     * @throws \InvalidArgumentException If entity is not supported.
     * @throws \LogicException Some required bundle not registered.
     */
    public function createAction(Request $request)
    {
        $manager = $this->getManager();
        $government = $manager->create();

        $form = $this->createFormBuilder()
            ->add('main', 'government')
            ->add(
                'extension',
                new ExtGovernmentType($this->adminEnvironmentManager())
            )
            ->setData([ 'main' => $government, 'extension' =>[] ])
            ->getForm();
        $form->handleRequest($request);

        if ($form->isValid()) {
            $manager->update($government);

            /*
             * Update carto db service.
             */
            $this->get(CartoDbServices::CARTO_DB_API)
                ->sqlRequest("
                    INSERT INTO {$government->getEnvironment()->getSlug()}
                        (alt_type_slug, slug)
                    VALUES
                        (
                            '{$government->getAltTypeSlug()}',
                            '{$government->getSlug()}'
                        )
                ");

            $data = $form->getData()['extension'];
            $data['government_id'] = $government->getId();

            $this->adminEnvironmentManager()->addToGovernment($data);

            $this->addFlash(
                'admin_success',
                'Government '. $government->getName() .' successfully created'
            );

            return $this->redirectToRoute('govwiki_admin_government_index');
        }

        return [
            'form' => $form->createView(),
            'formats' => $this->adminEnvironmentManager()->getFormats(),
        ];
    }

    /**
     * @Configuration\Route(
     *  "/{id}/edit",
     *  requirements={"id": "\d+"}
     * )
     * @Configuration\Template()
     *
     * @param Request    $request    A Request instance.
     * @param Government $government A Government instance.
     *
     * @return array
     *
     * @throws \InvalidArgumentException If entity is not supported.
     * @throws \LogicException Some required bundle not registered.
     */
    public function editAction(Request $request, Government $government)
    {
        $data = $this->adminEnvironmentManager()
            ->getGovernment($government->getId());

        $form = $this->createFormBuilder()
            ->add('main', 'government')
            ->add(
                'extension',
                new ExtGovernmentType(
                    $this->adminEnvironmentManager(),
                    $government->getAltType()
                )
            )
            ->setData([ 'main' => $government, 'extension' => $data ])
            ->getForm();
        $form->handleRequest($request);

        /*
         * For cartodb update.
         */
        $oldSlug = $government->getSlug();
        $oldAltTypeSlug = $government->getAltTypeSlug();

        if ($form->isValid()) {
            $file = $government->getSecondaryLogo();

            if ($file instanceof UploadedFile) {
                $filename = strtolower(
                    $government->getAltTypeSlug() .'_'. $government->getSlug() .
                    '.'. $file->getClientOriginalExtension()
                );

                $file->move(
                    $this->getParameter('kernel.root_dir') .'/../web/img/upload',
                    $filename
                );

                $government->setSecondaryLogoPath('/img/upload/'. $filename);
            }


            $this->getManager()->update($government);

            /*
            * Update government record in CartoDB dataset.
            */
            $colorizedCountyConditions = $this->adminEnvironmentManager()->getMap()
                ->getColorizedCountyConditions();
            $colorizedFieldName = $colorizedCountyConditions->getFieldName();
            $isColorized = $colorizedCountyConditions->isColorized();

            $sql = "
                UPDATE {$government->getEnvironment()->getSlug()}
                SET
                    alt_type_slug = '{$government->getAltTypeSlug()}',
                    slug = '{$government->getSlug()}'
            ";

            $extraGovernmentData = $form->getData()['extension'];
            if ($isColorized && $colorizedFieldName &&
                array_key_exists($colorizedFieldName, $extraGovernmentData)) {
                $sql .= ", data = {$extraGovernmentData[$colorizedFieldName]} ";
            }

            $this->get(CartoDbServices::CARTO_DB_API)
                ->sqlRequest($sql ." WHERE
                    alt_type_slug = '{$oldAltTypeSlug}' AND
                    slug = '{$oldSlug}'
                ");

            $this->adminEnvironmentManager()
                ->updateGovernment($extraGovernmentData);

            $this->addFlash('admin_success', 'Government '.
                $government->getName() .' saved');

            return $this->redirectToRoute('govwiki_admin_government_index');
        }

        return [
            'id' => $government->getId(),
            'form' => $form->createView(),
            'formats' => $this->adminEnvironmentManager()
                ->getFormats(false, $government->getAltType()),
        ];
    }

    /**
     * @Configuration\Route("/{id}/remove")
     *
     * @param Government $government A Government instance.
     *
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     *
     * @throws \LogicException Some required bundle not registered.
     */
    public function removeAction(Government $government)
    {
        /*
         * Update carto db service.
         */
        $this->get(CartoDbServices::CARTO_DB_API)
            ->sqlRequest("
                DELETE FROM {$this->adminEnvironmentManager()->getSlug()}
                WHERE alt_type_slug = '{$government->getAltTypeSlug()}' AND
                    slug = '{$government->getSlug()}'
            ");

        $em = $this->getDoctrine()->getManager();

        $em->remove($government);
        $this->adminEnvironmentManager()
            ->deleteFromGovernment($government->getId());
        $em->flush();

        $this->addFlash('admin_success', 'Government removed');
        return $this->redirectToRoute('govwiki_admin_government_index');
    }

    /**
     * @Configuration\Route("/import")
     * @Configuration\Template()
     *
     * @param Request $request A Request instance.
     *
     * @return array
     */
    public function importAction(Request $request)
    {
        /*
         * Build form.
         */
        $form = $this->createFormBuilder()
                ->add('file', 'file', [
                    'label' => 'CSV file'
                ])
            ->getForm();

        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            /** @var UploadedFile $file */
            $file = $form->getData()['file'];
            $file->move($this->getParameter('kernel.logs_dir'), $file->getFilename());
            $filePath = $this->getParameter('kernel.logs_dir').'/'.$file->getFilename();

            $this->get(GovWikiDbServices::GOVERNMENT_IMPORTER)
                ->import(
                    new CsvReader($filePath)
                );
            unlink($filePath);


//            $this->get(GovWikiDbServices::GOVERNMENT_IMPORTER)
//                ->import(
//                    $file->getPath() .'/'. $file->getFilename(),
//                    $manager->getTransformer('csv')
//                );

//            /*
//             * Send to CartoDB;
//             */
//            $environmentManager = $this->adminEnvironmentManager();
//
//            $environment = $environmentManager->getEnvironment();
//            $filePath = $this->getParameter('kernel.logs_dir').'/'.
//                $environment.'.json';
//
//            $transformerManager = $this
//                ->get(GovWikiAdminServices::TRANSFORMER_MANAGER);
//
//            $this->get(GovWikiDbServices::GOVERNMENT_IMPORTER)
//                ->export(
//                    $filePath,
//                    $transformerManager->getTransformer('geo_json'),
//                    [ 'id', 'altTypeSlug', 'slug', 'latitude', 'longitude' ]
//                );
//
//            $this->get(CartoDbServices::CARTO_DB_API)
//                ->dropDataset($environment)
//                ->importDataset($filePath);
            return $this->redirectToRoute('govwiki_admin_government_index');
        }

        return [ 'form' => $form->createView() ];
    }

    /**
     * @Configuration\Route("/export")
     * @Configuration\Template()
     *
     * @return array|BinaryFileResponse
     */
    public function exportAction()
    {
        $filePath = $this->getParameter('kernel.logs_dir') . '/government.csv';

        $this->get(GovWikiDbServices::GOVERNMENT_IMPORTER)
            ->export(new CsvWriter($filePath));

        //$response = new BinaryFileResponse($filePath);
        $response = new Response(file_get_contents($filePath));
        $response->headers->set('Cache-Control', 'public');
        $response->headers->set(
            'Content-Disposition',
            'attachment; filename=government.csv'
        );

        unlink($filePath);
        return $response;
    }

    /**
     * @return \GovWiki\AdminBundle\Manager\Entity\AdminGovernmentManager
     */
    private function getManager()
    {
        return $this->get(GovWikiAdminServices::GOVERNMENT_MANAGER);
    }
}
