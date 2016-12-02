<?php

namespace GovWiki\EnvironmentBundle\Command;

use Doctrine\DBAL\Connection;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Tools\Pagination\Paginator;
use GovWiki\DbBundle\Entity\Environment;
use GovWiki\DbBundle\Entity\Government;
use GovWiki\DbBundle\Entity\Repository\EnvironmentRepository;
use GovWiki\DbBundle\Entity\Repository\GovernmentRepository;
use GovWiki\GeneratorBundle\GovWikiGeneratorService;
use GovWiki\GeneratorBundle\Service\PidPoolFactory;
use Mmoreram\GearmanBundle\Service\GearmanClient;
use Mmoreram\GearmanBundle\Service\GearmanExecute;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Filesystem\LockHandler;

/**
 * Class ParseCaliforniaGovernmentsCommand
 * @package GovWiki\EnvironmentBundle\Command
 */
class ParseCaliforniaGovernmentsCommand extends ContainerAwareCommand
{

    const BASE_URL = 'http://californiapolicycenter.org/tag/{tag}/feed';

    const WORKER_COUNT = 4;

    const COUNTER_FILE = 'offset.txt';

    const LIMIT = 100;

    /**
     * Configures the current command.
     *
     * @return void
     */
    protected function configure()
    {
        $this
            ->setName('govwiki:california:government:parse')
            ->setDescription("
                Grab issues data from civicprofiles.californiapolicycenter.org and store in our database.
            ");
    }

    /**
     * Executes the current command.
     *
     * This method is not abstract because you can use this class
     * as a concrete class. In this case, instead of defining the
     * execute() method, you set the code to execute by passing
     * a Closure to the setCode() method.
     *
     * @param InputInterface  $input  An InputInterface instance.
     * @param OutputInterface $output An OutputInterface instance.
     *
     * @return null|int null or 0 if everything went fine, or an error code.
     *
     * @throws \LogicException When this abstract method is not implemented.
     *
     * @see setCode()
     *
     * @SuppressWarnings(PHPMD.UnusedFormalParameter)
     */
    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $lock = new LockHandler('pares_california_governments');
        if (! $lock->lock()) {
            $output->writeln('This command already run.');
            return 1;
        }

        try {
            // Get last processed offset.
            $offset = $this->getOffset();

            // Generate urls for necessary governments and compute next offset.
            $urls = $this->generateUrls($this->getGovernmentsSlug($offset));
            $offset += count($urls);

            $output->write('Parsing data ... ');
            // Process all urls.
            $this->process($urls);
            // Save new offset.
            $this->storeOffset($offset);
        } catch (\Exception $e) {
            $output->writeln('[ <error>error</error> ]');
            $output->writeln($e->getMessage());
            return 1;
        } finally {
            $lock->release();
        }

        $output->writeln('[ <info>OK</info> ]');
        return 0;
    }

    /**
     * @param array|\Generator $governmentsSlug Array of government slugs.
     *
     * @return string[]
     */
    private function generateUrls($governmentsSlug)
    {
        $urls = [];

        foreach ($governmentsSlug as $row) {
            $slug = str_replace('_', '-', current($row));
            $urls[key($row)] = str_replace('{tag}', $slug, self::BASE_URL);
        }

        return $urls;
    }

    /**
     * @return integer
     */
    private function getOffset()
    {
        $path = $this->getContainer()->getParameter('kernel.cache_dir');
        $file = $path .'/'. self::COUNTER_FILE;

        if (file_exists($file)) {
            return (int) file_get_contents($file);
        }

        return 0;
    }

    /**
     * @param integer $offset New offset.
     *
     * @return void
     */
    private function storeOffset($offset)
    {
        /** @var EntityManagerInterface $em */
        $em = $this->getContainer()->get('doctrine.orm.default_entity_manager');
        $environment = $this->getCaliforniaEnvironment();
        /** @var GovernmentRepository $repository */
        $repository = $em->getRepository('GovWikiDbBundle:Government');

        $qb = $repository->getListQuery($environment->getId());

        // Get total government's count.
        $totalCount = (new Paginator($qb))->count();

        $path = $this->getContainer()->getParameter('kernel.cache_dir');
        $file = $path .'/'. self::COUNTER_FILE;

        $offset = ($offset <= $totalCount) ? $offset : 0;

        file_put_contents($file, $offset);
    }

    /**
     * @param integer $offset Offset.
     *
     * @return \Generator
     */
    private function getGovernmentsSlug($offset = 0)
    {
        /** @var EntityManagerInterface $em */
        $em = $this->getContainer()->get('doctrine.orm.default_entity_manager');
        /** @var GovernmentRepository $repository */
        $repository = $em->getRepository('GovWikiDbBundle:Government');
        $environment = $this->getCaliforniaEnvironment();

        $iterate = $repository
            ->getListQuery($environment->getId())
            ->select('Government.id, Government.slug')
            ->setMaxResults(self::LIMIT)
            ->setFirstResult($offset)
            ->getQuery()
            ->iterate();

        foreach ($iterate as $object) {
            $object = current($object);

            yield [$object['id'] => $object['slug']];
            $em->clear();
        }
    }

    /**
     * @return Environment
     */
    private function getCaliforniaEnvironment()
    {
        /** @var EntityManagerInterface $em */
        $em = $this->getContainer()->get('doctrine.orm.default_entity_manager');
        /** @var EnvironmentRepository $repository */
        $repository = $em->getRepository('GovWikiDbBundle:Environment');

        $environment = $repository->getByName('california');
        if (! $environment instanceof Environment) {
            throw new \RuntimeException('Can\'t get california environment.');
        }

        return $environment;
    }

    /**
     * @param array       $urls     Array of xml urls.
     * @param ProgressBar $progress A ProgressBar instance.
     *
     * @return boolean
     */
    private function process(array $urls)
    {
        /** @var EntityManagerInterface $em */
        $em = $this->getContainer()->get('doctrine.orm.default_entity_manager');/** @var PidPoolFactory $pidPoolFactory */
        $pidPoolFactory = $this->getContainer()
            ->get(GovWikiGeneratorService::PID_POOL_FACTORY);

        $pidPool = $pidPoolFactory->create('califorina_issue_parser');
        $pidPool
            ->restore()
            ->sendSignal(SIGKILL)
            ->clear();

        // Get creator.
        $creator = $em->getRepository('GovWikiUserBundle:User')->findOneBy([
            'username' => 'joffemd',
        ])->getId();

        /** @var GearmanExecute $executor */
        $executor = $this->getContainer()->get('gearman.execute');

        for ($i = 0; $i < self::WORKER_COUNT; ++$i) {
            $pid = pcntl_fork();
            if ($pid) {
                $pidPool->add($pid);
            } else {
                $executor->executeWorker('CaliforniaParser');
            }
        }

        // Reopen db connection.
        /** @var Connection $conn */
        $conn = $this->getContainer()->get('database_connection');
        $conn->close();
        $conn->connect();

        // Store all childs pids.
        $pidPool->store();
        /** @var GearmanClient $client */
        $client = $this->getContainer()->get('gearman');

        foreach ($urls as $id => $url) {
            $payload = [
                'creator' => $creator,
                'government' => $id,
                'url' => $url,
            ];

            $client->addTask('CaliforniaParser~parseRss', serialize($payload));
        }

        $result = $client->runTasks();

        // Close childs process.
        $pidPool
            ->sendSignal(SIGKILL)
            ->clear();

        return $result;
    }
}
