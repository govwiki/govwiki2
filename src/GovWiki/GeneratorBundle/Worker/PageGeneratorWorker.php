<?php

namespace GovWiki\GeneratorBundle\Worker;

use Doctrine\Bundle\DoctrineBundle\Registry;
use Doctrine\DBAL\Connection;
use Doctrine\ORM\EntityManagerInterface;
use GovWiki\DbBundle\Entity\Environment;
use GovWiki\DbBundle\Entity\Repository\EnvironmentRepository;
use GovWiki\DbBundle\Entity\Repository\IssuesRepository;
use GovWiki\DbBundle\Entity\Repository\PensionRepository;
use GovWiki\DbBundle\Entity\Repository\SalaryRepository;
use GovWiki\EnvironmentBundle\GovWikiEnvironmentService;
use GovWiki\EnvironmentBundle\Manager\FinData\FinDataProcessorInterface;
use GovWiki\EnvironmentBundle\Manager\Government\GovernmentManagerInterface;
use GovWiki\EnvironmentBundle\Storage\EnvironmentStorageInterface;
use JMS\Serializer\SerializationContext;
use Mmoreram\GearmanBundle\Driver\Gearman;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;
use Symfony\Component\Finder\Finder;
use Symfony\Component\Finder\SplFileInfo;
use Symfony\Component\Templating\EngineInterface;
use Symfony\Component\Translation\TranslatorInterface;

/**
 * Class PageGeneratorWorker
 * @package GovWiki\GeneratorBundle\Worker
 *
 * @Gearman\Work(
 *  name="PageGenerator",
 *  service="govwiki_generator.worker.page_generator",
 *  description="Generate HTML pages for government or elected official entity"
 * )
 */
class PageGeneratorWorker implements ContainerAwareInterface
{

    use ContainerAwareTrait;

    const TYPE_DESKTOP = 'desktop';
    const TYPE_MOBILE = 'mobile';

    const DESKTOP_GOVERNMENT_TEMPLATE =
        'GovWikiGeneratorBundle:HtmlCommand/Desktop/Government:index.html.twig';

    const MOBILE_GOVERNMENT_TEMPLATE =
        'GovWikiGeneratorBundle:HtmlCommand/Mobile/Government:index.html.twig';

    const DESKTOP_ELECTED_TEMPLATE =
        'GovWikiGeneratorBundle:HtmlCommand/Desktop/Elected:index.html.twig';

    const MOBILE_ELECTED_TEMPLATE =
        'GovWikiGeneratorBundle:HtmlCommand/Mobile/Elected:index.html.twig';

    /**
     * @var LoggerInterface
     */
    private $logger;

    /**
     * @param LoggerInterface $logger A LoggerInterface instance.
     */
    public function __construct(LoggerInterface $logger)
    {
        $this->logger = $logger;
    }

    /**
     * Generate desktop and mobile html page for specified government.
     *
     * @Gearman\Job(
     *  name="government",
     *  description="Generate desktop and mobile html page for specified
     *  government."
     * )
     *
     * @param \GearmanJob $job A GearmanJob instance.
     *
     * @return boolean
     */
    public function generateGovernment(\GearmanJob $job)
    {
        // Reopen db connection.
        /** @var Connection $conn */
        $conn = $this->container->get('database_connection');
        $conn->close();
        $conn->connect();

        // Get payload.
        $payload = unserialize($job->workload());
        $slug = $payload['slug'];
        $altTypeSlug = $payload['altTypeSlug'];
        $years = $payload['years'];
        $environment = $this->getEnvironment($payload);

        $this->clearTranslationsCache();

        /** @var EntityManagerInterface $em */
        $em = $this->container->get('doctrine.orm.default_entity_manager');
        /** @var GovernmentManagerInterface $manager */
        $manager = $this->container
            ->get(GovWikiEnvironmentService::GOVERNMENT_MANAGER);
        /** @var FinDataProcessorInterface $processor */
        $processor = $this->container
            ->get(GovWikiEnvironmentService::FINDATA_PROCESSOR);
        /** @var TranslatorInterface $translator */
        $translator = $this->container->get('translator');
        /** @var EngineInterface $templating */
        $templating = $this->container->get('templating');
        /** @var EnvironmentStorageInterface $storage */
        $storage = $this->container->get(GovWikiEnvironmentService::STORAGE);
        $storage->set($environment);

        $outputPath = $this->container
            ->getParameter('government_generation_output');

        $message = 'Process government '. $altTypeSlug .'/'. $slug;
        $this->logger->info($message);

        foreach ($years as $year) {
            // Get government data.
            try {
                $data = $manager->getGovernment(
                    $environment,
                    $altTypeSlug,
                    $slug,
                    $year
                );

                $government = $data['government']['id'];

                $finData = $data['government']['finData'];
                $data['government']['financialStatements'] = $processor
                    ->process($finData);

                $data['years'] = $years;
                $data['currentYear'] = $year;
                $data['government']['translations'] = [
                    'total_revenue' => $translator
                        ->trans('general.findata.main.total_revenue'),
                    'total_expenditure' => $translator
                        ->trans('general.findata.main.total_expenditure'),
                ];
                $data['government_json'] = json_encode($data['government']);
                $data['hasSalaries'] = $em
                    ->getRepository('GovWikiDbBundle:Salary')
                    ->has($data['government']['id'], $year);
                $data['hasPensions'] = $em
                    ->getRepository('GovWikiDbBundle:Pension')
                    ->has($data['government']['id'], $year);

                $data['environment'] = $environment;

                $data['issues'] = $this->getIssues($government);
                $data['salaries'] = [];
                $data['pensions'] = [];
                if ($data['hasSalaries']) {
                    $data['salaries'] = $this->getSalaries($government, $year);
                }

                if ($data['hasPensions']) {
                    $data['pensions'] = $this->getPensions($government, $year);
                }

                $fileName = $altTypeSlug . '_' . $slug;
                $desktop = $templating
                    ->render(self::DESKTOP_GOVERNMENT_TEMPLATE, $data);
                $mobile = $templating
                    ->render(self::MOBILE_GOVERNMENT_TEMPLATE, $data);
            } catch (\Exception $e) {
                $message = 'Error while processing government '
                    . $altTypeSlug .'/'. $slug .': '
                    . $e->getMessage();
                $this->logger->error($message);
                return false;
            }
            $desktopFilePath = $outputPath .'/'. $fileName .'_desktop.html';
            $mobileFilePath = $outputPath .'/'. $fileName .'_mobile.html';

            file_put_contents($desktopFilePath, $desktop);
            file_put_contents($mobileFilePath, $mobile);
        }

        return true;
    }

    /**
     * Generate desktop and mobile html page for specified elected official.
     *
     * @Gearman\Job(
     *  name="elected",
     *  description="Generate desktop and mobile html page for specified
     *  elected official."
     * )
     *
     * @param \GearmanJob $job A GearmanJob instance.
     *
     * @return boolean
     */
    public function generateElected(\GearmanJob $job)
    {
        // Reopen db connection.
        /** @var Connection $conn */
        $conn = $this->container->get('database_connection');
        $conn->close();
        $conn->connect();

        $this->clearTranslationsCache();

        $payload = unserialize($job->workload());

        $altTypeSlug = $payload['altTypeSlug'];
        $slug = $payload['slug'];
        $electedSlug = $payload['electedSlug'];

        $environment = $this->getEnvironment($payload);
        $manager = $this->container
            ->get(GovWikiEnvironmentService::ELECTED_OFFICIAL_MANAGER);

        $this->clearTranslationsCache();

        /** @var EngineInterface $templating */
        $templating = $this->container->get('templating');
        /** @var EnvironmentStorageInterface $storage */
        $storage = $this->container->get(GovWikiEnvironmentService::STORAGE);
        $storage->set($environment);

        $outputPath = $this->container
            ->getParameter('elected_generation_output');

        $message = 'Process elected '. $altTypeSlug .'/'. $slug .'/'
            . $electedSlug;
        $this->logger->info($message);

        try {
            $data = $manager->getElectedOfficial(
                $environment,
                $altTypeSlug,
                $slug,
                $electedSlug
            );

            if ($data === null) {
                return false;
            }

            /** @var \Doctrine\ORM\QueryBuilder $endorsement */
            $endorsement = $data['endorsements'];
            $data['endorsements'] = $endorsement->getQuery()->getResult();

            /** @var \Doctrine\ORM\QueryBuilder $surveyResponses */
            $surveyResponses = $data['surveyResponses'];
            $data['surveyResponses'] = $surveyResponses->getQuery()
                ->getResult();

            $context = new SerializationContext();
            $context->setGroups(['elected_official']);

            // Serialize elected official to json.
            $electedOfficialJSON = $this->container->get('jms_serializer')
                ->serialize($data['electedOfficial'], 'json', $context);

            $data = array_merge($data, [
                'altTypeSlug' => $altTypeSlug,
                'slug' => $slug,
                'electedOfficialJSON' => $electedOfficialJSON,
            ]);

            $desktop = $templating
                ->render(self::DESKTOP_ELECTED_TEMPLATE, $data);
            $mobile = $templating
                ->render(self::MOBILE_ELECTED_TEMPLATE, $data);

            $fileName = $altTypeSlug . '_' . $slug .'_'. $electedSlug;

            $desktopFilePath = $outputPath .'/'. $fileName .'_desktop.html';
            $mobileFilePath = $outputPath .'/'. $fileName .'_mobile.html';

            file_put_contents($desktopFilePath, $desktop);
            file_put_contents($mobileFilePath, $mobile);
        } catch (\Exception $e) {
            $message = 'Error while processing elected '
                . $altTypeSlug .'/'. $slug .'/'. $electedSlug .': '
                . $e->getMessage();
            $this->logger->error($message);
            return false;
        }

        return true;
    }

    /**
     * @return void
     */
    private function clearTranslationsCache()
    {
        try {
            $cacheDir = $this->container->getParameter('kernel.cache_dir');

            if (file_exists($cacheDir . '/translations')) {
                $finder = new Finder();
                $finder->in([$cacheDir . '/translations'])->files();

                /** @var SplFileInfo $file */
                foreach ($finder as $file) {
                    @unlink($file->getRealpath());
                }
            }
        } catch (\Exception $e) {
            // Ignore all exceptions.
        }
    }

    /**
     * @param array $payload Job payload.
     *
     * @return null|Environment
     */
    private function getEnvironment(array $payload)
    {
        /** @var Registry $doctrine */
        $doctrine = $this->container->get('doctrine');
        /** @var EnvironmentRepository $repository */
        $repository = $doctrine->getRepository('GovWikiDbBundle:Environment');

        return $repository->find($payload['environment']);
    }

    /**
     * @param integer $government A Government entity id.
     *
     * @return array
     */
    private function getIssues($government)
    {
        /** @var EntityManagerInterface $em */
        $em = $this->container->get('doctrine.orm.default_entity_manager');
        /** @var IssuesRepository $repository */
        $repository = $em->getRepository('GovWikiDbBundle:Issue');

        $issues = $repository->getListQuery($government)
            ->getQuery()
            ->getResult();
        $em->clear();

        return $issues;
    }

    /**
     * @param integer $government A Government entity id.
     * @param integer $year       A salaries year.
     *
     * @return array
     */
    private function getSalaries($government, $year)
    {
        /** @var EntityManagerInterface $em */
        $em = $this->container->get('doctrine.orm.default_entity_manager');
        /** @var SalaryRepository $repository */
        $repository = $em->getRepository('GovWikiDbBundle:Salary');

        $salaries = $repository->getListQuery($government, $year)
            ->getQuery()
            ->getResult();
        $em->clear();

        return $salaries;
    }

    /**
     * @param integer $government A Government entity id.
     * @param integer $year       A salaries year.
     *
     * @return array
     */
    private function getPensions($government, $year)
    {
        /** @var EntityManagerInterface $em */
        $em = $this->container->get('doctrine.orm.default_entity_manager');
        /** @var PensionRepository $repository */
        $repository = $em->getRepository('GovWikiDbBundle:Pension');

        $pensions = $repository->getListQuery($government, $year)
            ->getQuery()
            ->getResult();
        $em->clear();

        return $pensions;
    }
}
