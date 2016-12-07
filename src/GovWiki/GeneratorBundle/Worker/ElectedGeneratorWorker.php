<?php

namespace GovWiki\GeneratorBundle\Worker;

use Doctrine\Bundle\DoctrineBundle\Registry;
use Doctrine\DBAL\Connection;
use Doctrine\ORM\EntityManagerInterface;
use GovWiki\DbBundle\Entity\Environment;
use GovWiki\DbBundle\Entity\Repository\EnvironmentRepository;
use GovWiki\EnvironmentBundle\GovWikiEnvironmentService;
use GovWiki\EnvironmentBundle\Storage\EnvironmentStorageInterface;
use JMS\Serializer\SerializationContext;
use Mmoreram\GearmanBundle\Driver\Gearman;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Finder\Finder;
use Symfony\Component\Finder\SplFileInfo;
use Symfony\Component\Templating\EngineInterface;

/**
 * Class ElectedGeneratorWorker
 * @package GovWiki\GeneratorBundle\Worker
 *
 * @Gearman\Work(
 *  name="ElectedGenerator",
 *  service="govwiki_generator.worker.elected_generator",
 *  description="Generate HTML pages for elected official entity"
 * )
 */
class ElectedGeneratorWorker implements ContainerAwareInterface
{

    use ContainerAwareTrait;

    const TYPE_DESKTOP = 'desktop';
    const TYPE_MOBILE = 'mobile';

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
     * Generate desktop and mobile html page for specified elected official.
     *
     * @Gearman\Job(
     *  name="generate",
     *  description="Generate desktop and mobile html page for specified
     *  elected official."
     * )
     *
     * @param \GearmanJob $job A GearmanJob instance.
     *
     * @return boolean
     */
    public function generate(\GearmanJob $job)
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

        /** @var EntityManagerInterface $em */
        $em = $this->container->get('doctrine.orm.default_entity_manager');
        /** @var EngineInterface $templating */
        $templating = $this->container->get('templating');
        /** @var EnvironmentStorageInterface $storage */
        $storage = $this->container->get(GovWikiEnvironmentService::STORAGE);
        /** @var Filesystem $filesystem */
        $filesystem = $this->container->get('filesystem');

        $storage->set($environment);

        $outputPath = $this->container
            ->getParameter('elected_generation_output') .'/'
                . $environment->getSlug();

        try {
            $filesystem->mkdir($outputPath);

            $message = 'Process elected '. $altTypeSlug .'/'. $slug .'/'
                . $electedSlug;
            $this->logger->info($message);

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

            $em->clear();

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
        } finally {
            $em->clear();
            gc_collect_cycles();
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
}
