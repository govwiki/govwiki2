<?php

namespace GovWiki\AdminBundle\Controller;

use GovWiki\AdminBundle\GovWikiAdminServices;
use GovWiki\DbBundle\Entity\Environment;
use GovWiki\DbBundle\GovWikiDbServices;
use GovWiki\DbBundle\Importer\GovernmentImporter;
use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\Request;
use GovWiki\DbBundle\Entity\Government;
use GovWiki\DbBundle\Form\GovernmentType;

/**
 * GovernmentController
 *
 * @Configuration\Route("/{environment}/government")
 */
class GovernmentController extends AbstractGovWikiAdminController
{
    /**
     * Show list of governments for current environment.
     *
     * @Configuration\Route("/", methods="GET")
     * @Configuration\Template()
     *
     * @param Request $request     A Request instance.
     * @param string  $environment Environment name.
     *
     * @return array
     */
    public function indexAction(Request $request, $environment)
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
            $this->getDoctrine()
                ->getRepository('GovWikiDbBundle:Government')
                ->getListQuery($environment, $id, $name),
            $request->query->getInt('page', 1),
            50
        );

        return [
            'governments' => $governments,
            'environment' => $environment,
        ];
    }

    /**
     * Create new government in current environment.
     *
     * @Configuration\Route("/create")
     * @Configuration\Template()
     *
     * @param Request $request     A Request instance.
     * @param string  $environment Environment name.
     *
     * @return array
     */
    public function createAction(Request $request, $environment)
    {
        $government = new Government();

        $government->setEnvironment(
            $this->getDoctrine()->getRepository('GovWikiDbBundle:Environment')
                ->getReferenceByName($environment)
        );

        $form = $this->createForm(new GovernmentType(), $government);
        $form->handleRequest($request);

        if ($form->isValid()) {
            $em = $this->getDoctrine()->getManager();

            $em->persist($government);
            $em->flush();
            $this->addFlash(
                'admin_success',
                'Government '. $government->getName() .' successfully created'
            );

            return $this->redirectToRoute('govwiki_admin_government_index');
        }

        return [
            'form' => $form->createView(),
            'environment' => $environment,
        ];
    }

    /**
     * @Configuration\Route("/{id}/edit", requirements={"id": "\d+"})
     * @Configuration\Template()
     *
     * @param Government $government  A Government instance.
     * @param Request    $request     A Request instance.
     *
     * @return array
     */
    public function editAction(Government $government, Request $request) {
        $form = $this->createForm(new GovernmentType(true), $government);
        $form->handleRequest($request);

        if ($form->isValid()) {
            $this->getDoctrine()->getManager()->flush();
            $this->addFlash('admin_success', 'Government '.
                $government->getName() .' saved');

            return $this->redirectToRoute('govwiki_admin_government_index');
        }

        return ['form' => $form->createView()];
    }

    /**
     * @Configuration\Route("/export")
     * @Configuration\Template()
     */
    public function exportAction()
    {

    }

    /**
     * @Configuration\Route("/import")
     * @Configuration\Template()
     *
     * @param Request $request     A Request instance.
     * @param string  $environment Environment name.
     *
     * @return array
     */
    public function importAction(Request $request, $environment)
    {
        $manager = $this->get(GovWikiAdminServices::TRANSFORMER_MANAGER);
        $data = [
            'file' => null,
            'type' => 0,
        ];

        /*
         * Build type choices;
         */
        $choices = $manager->getSupportedExtension();
        foreach ($choices as &$row) {
            $row = "{$row['name']} ({$row['extension']})";
        }

        /*
         * Build form.
         */
        $form = $this->createFormBuilder($data)
            ->add('file', 'file')
            ->add('type', 'choice', [
                'choices' => $choices
            ])->getForm();
        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            /** @var UploadedFile $file */
            $file = $form->getData()['file'];
            $this->get(GovWikiDbServices::GOVERNMENT_IMPORTER)
                ->import(
                    $file->getPath() .'/'. $file->getFilename(),
                    $manager->getTransformer($form->getData()['type'])
                );
        }

        return [
            'form' => $form->createView(),
            'environment' => $environment,
        ];
    }
}
