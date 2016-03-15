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
use GovWiki\DbBundle\Entity\Locale;
use GovWiki\DbBundle\Entity\Translation;
use GovWiki\DbBundle\Entity\Format;
use GovWiki\DbBundle\Entity\Fund;
use GovWiki\DbBundle\Entity\CaptionCategory;
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
    const WIZARD_GREETING_TEXT = 'wizard_greeting_text';
    const WIZARD_BOTTOM_TEXT = 'wizard_bottom_text';

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
                $this->setGreetingText(null);
                $this->setBottomText(null);
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
        $this->setGreetingText(null);
        $this->setBottomText(null);

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
            $this->setGreetingText($request->request->get('greetingText'));
            $this->setBottomText($request->request->get('bottomText'));

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

            $map->setCreated(true);

            $environment->setMap($map);
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

            $api = $this->get(CartoDbServices::CARTO_DB_API);

            /*
             * Create dataset for environments.
             */
            $api
                ->createDataset($environment->getSlug(), [
                    'alt_type_slug' => 'VARCHAR(255)',
                    'slug' => 'VARCHAR(255)',
                    'data_id' => 'bigint',
                    'name' => 'VARCHAR(255)',
                ]);

            $environment
                ->setStyle($style)
                ->setEnabled(true);

            $em = $this->getDoctrine()->getManager();

            $em->persist($environment);
            $em->flush();
            $this->storeEnvironmentEntity($environment);

            $this->get(GovWikiAdminServices::GOVERNMENT_TABLE_MANAGER)
                ->createGovernmentTable($environment->getSlug());

            $this->adminEnvironmentManager()->changeEnvironment($environment);

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
                    $this->getDoctrine()->getManager(),
                    $this->get(CartoDbServices::CARTO_DB_API),
                    $this->getEnvironmentEntity()
                );
                $parser = new \JsonStreamingParser_Parser($stream, $listener);
                $parser->parse();
            }

            $this->createLocale();

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
        $this->setGreetingText(null);
        $this->setBottomText(null);

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
     * @return string
     */
    private function getGreetingText()
    {
        return $this->get('session')->get(self::WIZARD_GREETING_TEXT, 0);
    }

    /**
     * @param string $greeting_text Greeting text.
     *
     * @return void
     */
    private function setGreetingText($greeting_text)
    {
        $this->get('session')->set(self::WIZARD_GREETING_TEXT, $greeting_text);
    }

    /**
     * @return string
     */
    private function getBottomText()
    {
        return $this->get('session')->get(self::WIZARD_BOTTOM_TEXT, 0);
    }

    /**
     * @param string $bottom_text Bottom text.
     *
     * @return void
     */
    private function setBottomText($bottom_text)
    {
        $this->get('session')->set(self::WIZARD_BOTTOM_TEXT, $bottom_text);
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

    /**
     * Create locale for new environment
     *
     * @var Environment $environment Environment object
     *
     * @return void
     */
    private function createLocale()
    {
        $em = $this->getDoctrine()->getManager();
        $session_env_id = $this->getEnvironmentEntity()->getId();
        $environment = $em->getRepository('GovWikiDbBundle:Environment')->find($session_env_id);
        $greeting_text = $this->getGreetingText();
        $bottom_text = $this->getBottomText();

        $locale = new Locale();
        $locale->setShortName('en');
        $locale->setEnvironment($environment);
        $em->persist($locale);

        // Translations for Greeting text and Bottom text are initially set into '' and can be changed in ckeditor
        $texts_list = array(
            'map.greeting_text' => $greeting_text,
            'general.bottom_text' => $bottom_text
        );
        foreach ($texts_list as $transKey => $transText) {
            $this->newTranslation($locale, $transKey, $transText, 'ckeditor');
        }

        // Translations for footer copyright and socials
        $env_styles = $environment->getStyle();
        foreach ($env_styles[0]['content'] as $outer_key => $item) {
            if ($item['block'] == 'footer' && isset($item['content']) && !empty($item['content'])) {
                foreach ($item['content'] as $inner_key => $content) {
                    $this->newTranslation($locale, 'footer.' . $content['block'], $content['content'], 'ckeditor');
                    unset($env_styles[0]['content'][$outer_key]['content'][$inner_key]);
                }
                break;
            }
        }
        $environment->setStyle($env_styles);

        // General translations
        $general_trans_list = array(
            'map.government.name' => 'Government Name',
            'map.select.types' => 'Select type(s)',
            'map.type_part_agency_name' => 'Type part of the agency’s name',
            'map.click_on_map' => 'or click it on the map',
            'header.links.return_to_map' => 'Return to Map',
            'gov.links.latest_audit' => 'Latest Audit',
            'gov.financial_statements' => 'Financial Statements',
            'preposition.of' => 'of'
        );
        foreach ($general_trans_list as $transKey => $transText) {
            $this->newTranslation($locale, $transKey, $transText);
        }

        /** @var Fund $fund */
        $fund_list = array(
            'funds.general_fund' => 'General Fund',
            'funds.other' => 'Other Funds',
            'funds.total' => 'Total Gov. Funds'
        );
        foreach ($fund_list as $transKey => $transText) {
            $this->preSaveTranslation($locale, $transKey, $transText);
        }

        $search  = array(' ', '-'  , '&'  , ','  , '(' , ')' , '/' , '%'   , "'");
        $replace = array('_', '_d_', 'amp', '_c_', 'lb', 'rb', 'sl', 'proc', "_apos_");
        /** @var CaptionCategory $captionCategory */
        $captionCategories = $em->getRepository('GovWikiDbBundle:CaptionCategory')->findAll();
        foreach ($captionCategories as $captionCategory) {
            $captionCategoryName = $captionCategory->getName();
            $captionCategoryName_slug = str_replace($search, $replace, $captionCategoryName);
            $captionCategoryName_slug = strtolower($captionCategoryName_slug);

            $this->preSaveTranslation($locale, 'caption_categories.' . $captionCategoryName_slug, $captionCategoryName);
        }

        /** @var Format $format */
        $formats = $environment->getFormats();
        foreach ($formats as $format) {
            $this->preSaveTranslation($locale, 'format.' . $format->getField(), $format->getName());
        }

        $em->flush();
    }

    private function preSaveTranslation($locale, $transKey, $transText)
    {
        $em = $this->getDoctrine()->getManager();

        $exist_translation = $em->getRepository('GovWikiDbBundle:Translation')->findOneBy(array(
            'locale' => $locale,
            'transKey' => $transKey
        ));

        if (!empty($exist_translation)) {
            $exist_translation->setTranslation($transText);
        } else {
            $this->newTranslation($locale, $transKey, $transText);
        }
    }

    private function newTranslation($locale, $transKey, $transText, $transTextareaType = null)
    {
        $em = $this->getDoctrine()->getManager();

        $translation = new Translation();
        $translation->setLocale($locale);
        $translation->setTransKey($transKey);
        $translation->setTranslation($transText);
        if (null !== $transTextareaType) {
            $translation->setTransTextareaType($transTextareaType);
        }
        $em->persist($translation);
    }
}
