<?php

namespace GovWiki\AdminBundle\Controller;

use CartoDbBundle\CartoDbServices;
use CartoDbBundle\Service\CartoDbApi;
use CartoDbBundle\Utils\NamedMap;
use Doctrine\DBAL\Connection;
use Doctrine\ORM\EntityManagerInterface;
use GovWiki\AdminBundle\GovWikiAdminServices;
use GovWiki\AdminBundle\Util\GeoJsonStreamListener;
use GovWiki\ApiBundle\GovWikiApiServices;
use GovWiki\DbBundle\Entity\Environment;
use GovWiki\DbBundle\Entity\Government;
use GovWiki\DbBundle\Entity\Map;
use GovWiki\DbBundle\Form\EnvironmentType;
use GovWiki\DbBundle\Form\MapType;
use GovWiki\DbBundle\GovWikiDbServices;
use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Validator\Constraints\Collection;

/**
 * Class WizardController
 * @package GovWiki\AdminBundle\Controller
 *
 * @Configuration\Route("/wizard")
 * @Configuration\Security("is_granted('ROLE_ADMIN')")
 */
class WizardController extends AbstractGovWikiAdminController
{
    const ENVIRONMENT_PARAMETER = 'wizard_environment';
    const WIZARD_STEP = 'wizard_step';

    /**
     * List of wizards step's, need for simplify methods next/prev step.
     *
     * @var array
     */
    private static $wizardSteps = [
        'step1', // Create new environment.
        'step2', // Create new map.
        'step3', // Edit styles.
        'step4', // Import data (Not required).
        'end',
    ];

    /**
     * Create new environment, setup name, domain and greeting texts.
     *
     * @Configuration\Route("/start")
     * @Configuration\Template()
     *
     * @param Request $request A Request instance.
     *
     * @return array|\Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function startAction(Request $request)
    {
        $isNotFinished = ($this->getEnvironmentEntity() !== null) &&
            ($this->getStep() !== 0);

        if ($request->isMethod('post')) {
            if ($request->request->has('new')) {
                /*
                 * Start new wizard.
                 */
                $this->storeEnvironmentEntity(null);
                $this->setStep(0);
            } else {
                /*
                 * Continue previous wizard.
                 */
                return $this
                    ->redirectToRoute(self::$wizardSteps[$this->getStep()]);
            }
        } elseif ($isNotFinished) {
            /*
             * Show information page.
             */
            return [];
        }

        /*
         * Redirect to first step.
         */
        return $this->redirectToRoute(self::$wizardSteps[0]);
    }

    /**
     * @Configuration\Route("/cancel")
     *
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function cancelAction()
    {
        $this->setStep(0);
        $this->storeEnvironmentEntity(null);

        return $this->redirectToRoute('govwiki_admin_main_home');
    }

    /**
     * Create new environment.
     *
     * @Configuration\Route("/environment", name="step1")
     * @Configuration\Template()
     *
     * @param Request $request A Request instance.
     *
     * @return array|\Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function environmentAction(Request $request)
    {
        $environment = $this->getEnvironmentEntity();
        if (null === $environment) {
            $environment = new Environment();
        }
        $form = $this->createForm(new EnvironmentType(), $environment);
        $form->handleRequest($request);

        if ($form->isValid() && $form->isSubmitted()) {
            /*
             * Proceed to next step.
             */
            $this->storeEnvironmentEntity($environment);
            return $this->nextStep();
        }
        return [ 'form' => $form->createView() ];
    }

    /**
     * @Configuration\Route("/map", name="step2")
     * @Configuration\Template()
     *
     * @param Request $request A Request instance.
     *
     * @return array|\Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function mapAction(Request $request)
    {
        $environment = $this->getEnvironmentEntity();

        $map = $this->getEnvironmentEntity()->getMap();
        if (null === $map) {
            $map = new Map();
        }
        $map->setEnvironment($environment);

        $form = $this->createForm(new MapType(true), $map);

        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            $dataFile = $map->getCountyFile();
            $map->setCountyFile(null);

            $em = $this->getDoctrine()->getManager();
            $em->persist($environment);
            $em->flush();

            $api = $this->get(CartoDbServices::CARTO_DB_API);

            /*
             * Parse data file.
             */
            $stream = fopen($dataFile->getPathname(), 'r');
            $listener = new GeoJsonStreamListener(
                $environment,
                $this->getDoctrine()->getManager(),
                $api
            );
            $parser = new \JsonStreamingParser_Parser($stream, $listener);
            $parser->parse();

            $cartoDbMap = $map->toNamedMap($environment->getSlug());
            $cartoDbMap->addLayer('SELECT * FROM '. $environment->getSlug(). '_county', '#ff0000');

            $s = $api->createMap($cartoDbMap);

            $this->storeEnvironmentEntity($environment);

            return $this->nextStep();
//            return $this->forward('GovWikiAdminBundle:Wizard:create');
        }

        return [
            'form' => $form->createView(),
            'environment' => $environment,
            'back_url' => $this->prevUrl(),
        ];
    }

    /**
     * @Configuration\Template()
     *
     * @return array[]
     */
    public function createAction()
    {
//        $tmpDir = $this->getParameter('kernel.root_dir') .
//            '/../web/img/';
//        $newFile = $tmpDir . $this->getEnvironmentEntity()->getSlug() . '.json';
//        copy($tmpDir . 'empty.json', $newFile);
//
//        return [
//            'itemQueueId' => $this->get(CartoDbServices::CARTO_DB_API)
//                ->importDataset($newFile, true),
//            'next' => $this->generateUrl('govwiki_admin_wizard_complete'),
//        ];
    }

    /**
     * @Configuration\Route("/map/check", methods={"GET"})
     *
     * @param Request $request A Request instance.
     *
     * @return JsonResponse
     */
    public function importAction(Request $request)
    {
        return new JsonResponse($this->get(CartoDbServices::CARTO_DB_API)
            ->checkImportProcess($request->query->get('item_queue_id')));
    }

    /**
     * @Configuration\Route("/map/create/complete")
     *
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function completeAction(Request $request)
    {
        $itemQueueId = $request->query->get('item_queue_id');

        $api = $this->get(CartoDbServices::CARTO_DB_API);
        $vizUrl =  $api
            ->getVizUrl($api->checkImportProcess($itemQueueId));

        $environment = $this->getEnvironmentEntity();

        $environment->getMap()
            ->setItemQueueId(null)
            ->setCreated(true)
            ->setVizUrl($vizUrl);

        $this->storeEnvironmentEntity($environment);

        return $this->nextStep();
    }

    /**
     * @Configuration\Route("/style", name="step3")
     * @Configuration\Template()
     *
     * @param Request $request A Request instance.
     *
     * @return array
     */
    public function styleAction(Request $request)
    {
        $manager = $this->get(GovWikiAdminServices::ADMIN_STYLE_MANAGER);
        $environment = $this->getEnvironmentEntity();
        $form = $manager->createForm(true);

        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            $style = $manager->processForm($form);

            $environment->setStyle($style);

            $em = $this->getDoctrine()->getManager();

            $environment->setEnabled(true);

            $em->persist($environment);
            $em->flush();
            $this->storeEnvironmentEntity($environment);

            $this->adminEnvironmentManager()
                ->createGovernmentTable($environment->getSlug());

            return $this->nextStep();
        }

        return [
            'form' => $form->createView(),
            'back_url' => $this->prevUrl(),
        ];
    }

    /**
     * @Configuration\Route("/data", name="step4")
     * @Configuration\Template()
     *
     * @param Request $request A Request instance.
     *
     * @return array
     */
    public function dataAction(Request $request)
    {
        $form = $this->createFormBuilder()
            ->add('dataFile', 'file', [ 'required' => false ])
            ->getForm();

        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            /** @var UploadedFile $dataFile */
            $dataFile = $form->getData()['dataFile'];

            if (null !== $dataFile) {
                /*
                 * Parse data file.
                 */
                $stream = fopen($dataFile->getPathname(), 'r');
                $listener = new GeoJsonStreamListener(
                    $this->getEnvironmentEntity(),
                    $this->getDoctrine()->getManager(),
                    $this->get(CartoDbServices::CARTO_DB_API)
                );
                $parser = new \JsonStreamingParser_Parser($stream, $listener);
                $parser->parse();
            }

            return $this->nextStep();
        }

        return [
            'form' => $form->createView(),
            'back_url' => $this->prevUrl(),
        ];
    }

    /**
     * @Configuration\Route("/complete", name="end")
     *
     * @return array
     */
    public function endAction()
    {
        $environment = $this->getEnvironmentEntity();

        $this->setStep(0);
        $this->storeEnvironmentEntity(null);

        return $this->redirectToRoute('govwiki_admin_main_show', [
            'environment' => $environment->getSlug(),
        ]);
    }

    /**
     * @param string $route Route name.
     *
     * @return integer
     */
    public static function getStepByRoute($route)
    {
        return array_search($route, self::$wizardSteps, true);
    }

    /**
     * @return Environment
     */
    private function getEnvironmentEntity()
    {
        $environment = $this->get('session')
            ->get(self::ENVIRONMENT_PARAMETER, null);

        if (null === $environment) {
            return null;
        }
        return unserialize($environment);
    }

    /**
     * @param Environment $environment A Environment instance.
     *
     * @return void
     */
    private function storeEnvironmentEntity(Environment $environment = null)
    {
        $this->get('session')
            ->set(self::ENVIRONMENT_PARAMETER, serialize($environment));
    }

    /**
     * @return integer
     */
    private function getStep()
    {
        return $this->get('session')->get(self::WIZARD_STEP, 0);
    }

    /**
     * @param integer $step Step index.
     *
     * @return void
     */
    private function setStep($step)
    {
        $this->get('session')->set(self::WIZARD_STEP, $step);
    }

    /**
     * Redirect to next step.
     *
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     */
    private function nextStep()
    {
        /*
         * Get current step index.
         */
        $step = $this->getStep() + 1;

        $stepsCount = count(self::$wizardSteps);
        if ($step >= $stepsCount) {
            $step = $stepsCount - 1;
        }
        $this->setStep($step);

        return $this->redirectToRoute(self::$wizardSteps[$step]);
    }

    /**
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     */
    private function prevUrl()
    {
        $step = $this->getStep() - 1;

        if ($step < 0) {
            $step = 0;
        }
        $this->setStep($step);

        return $this->generateUrl(self::$wizardSteps[$step]);
    }
}
