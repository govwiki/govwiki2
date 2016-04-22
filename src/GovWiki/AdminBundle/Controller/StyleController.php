<?php

namespace GovWiki\AdminBundle\Controller;

use Doctrine\Common\Collections\ArrayCollection;
use GovWiki\AdminBundle\Form\AddStyleForm;
use GovWiki\AdminBundle\Form\StyleForm;
use GovWiki\AdminBundle\GovWikiAdminServices;
use GovWiki\DbBundle\Entity\Category;
use GovWiki\DbBundle\Entity\Environment;
use GovWiki\DbBundle\Entity\EnvironmentStyles;
use GovWiki\DbBundle\Entity\Translation;
use GovWiki\DbBundle\Form\AbstractGroupType;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;
use Symfony\Component\HttpFoundation\Response;

/**
 * Class StyleController
 * @package GovWiki\AdminBundle\Controller
 *
 * @Configuration\Route(
 *  "/{environment}/style",
 *  requirements={ "environment": "\w+" }
 * )
 */
class StyleController extends AbstractGovWikiAdminController
{
    /**
     * @Configuration\Route("/")
     * @Configuration\Template()
     *
     * @param Request $request A Request instance.
     *
     * @return array
     */
    public function indexAction(Request $request)
    {
        // Get current exists styles for current environment.
        $styles = $this->getDoctrine()
            ->getRepository('GovWikiDbBundle:EnvironmentStyles')
            ->get(
                $this->getCurrentEnvironment()->getId()
            );
        $styles = new ArrayCollection($styles);
        $original = clone $styles;

        $form = $this->createForm(new StyleForm(), [ 'styles' => $styles ]);

        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            $em = $this->getDoctrine()->getManager();
            $environment = $this->getCurrentEnvironment();

            /** @var EnvironmentStyles $style */
            foreach ($original as $style) {
                if (! $styles->contains($style)) {
                    $em->remove($style);
                }
            }

            /** @var EnvironmentStyles $style */
            foreach ($styles as $style) {
                if ($style->getEnvironment() === null) {
                    $style->setEnvironment($environment);
                }

                $em->persist($style);
            }

            $environment->setStyle(
                $this->get('govwiki_admin.manager.style')
                    ->generate($styles->toArray())
            );
            $em->persist($environment);

            $em->flush();
        }

        return [
            'form' => $form->createView(),
            'environment_id' => $this->getCurrentEnvironment()->getId(),
        ];
    }

    /**
     * Export styles to csv format.
     *
     * @Configuration\Route("/export")
     *
     * @return Response
     */
    public function exportAction()
    {
        // Get current exists styles for current environment.
        $styles = $this->getDoctrine()
            ->getRepository('GovWikiDbBundle:EnvironmentStyles')
            ->get(
                $this->getCurrentEnvironment()->getId()
            );
        $environment = $this->getCurrentEnvironment()->getSlug();

        $filePath = $this->getParameter('kernel.logs_dir') . '/'. $environment .
            '.styles.csv';
        $fp = fopen($filePath, 'w');
        foreach ($styles as $style) {
            fputcsv($fp, [
                $style->getName(),
                $style->getClassName(),
                json_encode($style->getProperties()),
            ], ';');
        }
        fclose($fp);

        $response = new Response(file_get_contents($filePath));
        $response->headers->set('Cache-Control', 'public');
        $response->headers->set(
            'Content-Disposition',
            'attachment; filename=' . $environment . '.styles.csv'
        );

        unlink($filePath);
        return $response;
    }


    /**
     * Import styles in csv format.
     *
     * @Configuration\Route("/import")
     * @Configuration\Template()
     *
     * @param Request $request A Request instance.
     *
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function importAction(Request $request)
    {
        $form = $this->createFormBuilder()
            ->add('file', 'file')
            ->getForm();

        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            // Handle importing.
            $file = $form->getData()['file'];

            if ($file instanceof UploadedFile) {
                $em = $this->getDoctrine()->getManager();
                $file = $file->openFile();
                $environment = $this->getCurrentEnvironment();

                $em->getRepository('GovWikiDbBundle:EnvironmentStyles')
                    ->purge($environment->getId());

                $styles = [];
                for ($data = $file->fgetcsv(';');
                     ! $file->eof();
                     $data = $file->fgetcsv(';')) {
                    $style = new EnvironmentStyles();
                    $style
                        ->setEnvironment($environment)
                        ->setName($data[0])
                        ->setClassName($data[1])
                        ->setProperties($data[2], true);
                    $styles[] = $style;

                    $em->persist($style);
                }

                $environment->setStyle(
                    $this->get('govwiki_admin.manager.style')
                        ->generate($styles)
                );
                $em->persist($environment);

                $em->flush();
            }

            return $this->redirectToRoute('govwiki_admin_style_index', [
                'environment' => $environment->getSlug(),
            ]);
        }

        return [ 'form' => $form->createView() ];
    }
}
