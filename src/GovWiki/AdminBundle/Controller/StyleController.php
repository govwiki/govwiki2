<?php

namespace GovWiki\AdminBundle\Controller;

use Doctrine\Common\Collections\ArrayCollection;
use GovWiki\AdminBundle\Form\StyleForm;
use GovWiki\DbBundle\Entity\EnvironmentStyles;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\Request;
use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;
use Symfony\Component\HttpFoundation\Response;

/**
 * Class StyleController
 * @package GovWiki\AdminBundle\Controller
 *
 * @Configuration\Route(
 *  "/{environment}/{type}/style",
 *  requirements={
 *      "environment": "\w+",
 *      "type": "(desktop|mobile)"
 *  }
 * )
 */
class StyleController extends AbstractGovWikiAdminController
{
    /**
     * @Configuration\Route("/")
     * @Configuration\Template()
     *
     * @param Request $request A Request instance.
     * @param string  $type    Style type: desktop or mobile.
     *
     * @return array
     */
    public function indexAction(Request $request, $type)
    {
        $environment = $this->getCurrentEnvironment();

        // Get current exists styles for current environment.
        $styles = $this->getDoctrine()
            ->getRepository('GovWikiDbBundle:EnvironmentStyles')
            ->get($environment->getId(), $type);

        $styles = new ArrayCollection($styles);
        $original = clone $styles;

        $form = $this->createForm(new StyleForm(), [ 'styles' => $styles ]);

        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            $em = $this->getDoctrine()->getManager();

            /** @var EnvironmentStyles $style */
            foreach ($original as $style) {
                if (! $styles->contains($style)) {
                    $em->remove($style);
                }
            }

            /** @var EnvironmentStyles $style */
            foreach ($styles as $style) {
                if ($style->getEnvironment() === null) {
                    $style
                        ->setEnvironment($environment)
                        ->setType($type);
                }

                $em->persist($style);
            }

            $environment->updateStyle($styles->toArray(), $type);
            $em->persist($environment);

            $em->flush();
        }

        return [
            'form' => $form->createView(),
            'environment_id' => $environment->getId(),
            'type' => $type,
        ];
    }

    /**
     * Export styles to csv format.
     *
     * @Configuration\Route("/export")
     *
     * @param string $type Style type: desktop or mobile.
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function exportAction($type)
    {
        // Get current exists styles for current environment.
        $styles = $this->getDoctrine()
            ->getRepository('GovWikiDbBundle:EnvironmentStyles')
            ->get($this->getCurrentEnvironment()->getId(), $type);
        $environment = $this->getCurrentEnvironment()->getSlug();

        $filePath = $this->getParameter('kernel.logs_dir') .
            '/'. $environment .'_'. $type .'.styles.csv';

        $file = fopen($filePath, 'w');
        foreach ($styles as $style) {
            fputcsv($file, [
                $style->getName(),
                $style->getClassName(),
                json_encode($style->getProperties()),
            ], ';');
        }
        fclose($file);

        $response = new Response(file_get_contents($filePath));
        $response->headers->set('Cache-Control', 'public');
        $response->headers->set(
            'Content-Disposition',
            'attachment; filename='. $environment .'_'. $type .'.styles.csv'
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
     * @param string  $type    Style type: desktop or mobile.
     *
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function importAction(Request $request, $type)
    {
        $environment = $this->getCurrentEnvironment();

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

                $em->getRepository('GovWikiDbBundle:EnvironmentStyles')
                    ->purge($environment->getId(), $type);

                $styles = [];

                while (($data = $file->fgetcsv(';')) && (count($data) === 3)) {
                    $style = new EnvironmentStyles();
                    $style
                        ->setType($type)
                        ->setEnvironment($environment)
                        ->setName($data[0])
                        ->setClassName($data[1])
                        ->setProperties($data[2], true);
                    $styles[] = $style;

                    $em->persist($style);
                }

                $environment->updateStyle($styles, $type);
                $em->persist($environment);

                $em->flush();
            }

            return $this->redirectToRoute('govwiki_admin_style_index', [
                'environment' => $environment->getSlug(),
                'type' => $type,
            ]);
        }

        return [
            'form' => $form->createView(),
            'type' => $type,
        ];
    }
}
