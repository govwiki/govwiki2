<?php

namespace GovWiki\AdminBundle\Controller;

use CartoDbBundle\CartoDbServices;
use CartoDbBundle\Service\CartoDbApi;
use GovWiki\AdminBundle\GovWikiAdminServices;
use GovWiki\DbBundle\Entity\Environment;
use GovWiki\DbBundle\Entity\Map;
use GovWiki\DbBundle\Form\EnvironmentType;
use GovWiki\DbBundle\Form\MapType;
use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;
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
        'step1',
        'step2',
        'step3',
        'step4',
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
            $directory = $this->getParameter('kernel.logs_dir') .'/';
            $filename = "{$environment->getSlug()}_county.json";

            /** @var CartoDbApi $cartoDbApi */
            $cartoDbApi = $this->get(CartoDbServices::CARTO_DB_API);
            /*
             * Upload county dataset to CartoDB.
             */
            $file = $map->getCountyFile();
            $file->move($directory, $filename);
            $file = $directory . $filename;
            $itemQueueId = $cartoDbApi->importDataset($file, true);
            $map->setCountyFile(null);
            unlink($file);

            $map->setItemQueueId($itemQueueId);
            $this->storeEnvironmentEntity($environment);

            return $this->nextStep();
        }

        return [
            'form' => $form->createView(),
            'environment' => $environment,
            'back_url' => $this->prevUrl(),
        ];
    }

    /**
     * @Configuration\Route("/map/import", name="step3")
     * @Configuration\Template()
     *
     * @return array|\Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function checkAction()
    {
        $itemQueueId = $this->getEnvironmentEntity()->getMap()
            ->getItemQueueId();

        if (null === $itemQueueId) {
            return $this->nextStep();
        }

        return [
            'itemQueueId' => $itemQueueId,
            'url' => $this->generateUrl('govwiki_admin_wizard_complete'),
        ];
    }

    /**
     * @Configuration\Route("/map/import/complete")
     *
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function completeAction()
    {
        $itemQueueId = $this->getEnvironmentEntity()->getMap()
            ->getItemQueueId();

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
     * @Configuration\Route("/style", name="step4")
     * @Configuration\Template()
     *
     * @param Request $request A Request instance.
     *
     * @return array
     */
    public function styleAction(Request $request)
    {
        $manager = $this->get(GovWikiAdminServices::ADMIN_STYLE_MANAGER);
        $form = $manager->createForm();

        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            $style = $manager->processForm($form);
            $environment = $this->getEnvironmentEntity();
            $environment->setStyle($style);
            $this->storeEnvironmentEntity($environment);

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
        $em = $this->getDoctrine()->getManager();

        $environment->setEnabled(true);

        $em->persist($environment);
        $em->flush();

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
