<?php

namespace GovWiki\GeneratorBundle\Command;

use Doctrine\ORM\EntityManagerInterface;
use GovWiki\DbBundle\Entity\Environment;
use GovWiki\DbBundle\Entity\Repository\ElectedOfficialRepository;
use GovWiki\DbBundle\Entity\Repository\EnvironmentRepository;
use GovWiki\DbBundle\Entity\Repository\GovernmentRepository;
use GovWiki\EnvironmentBundle\GovWikiEnvironmentService;
use GovWiki\EnvironmentBundle\Manager\Government\GovernmentManagerInterface;
use GovWiki\GeneratorBundle\GovWikiGeneratorService;
use GovWiki\GeneratorBundle\Service\PidPoolFactory;
use Mmoreram\GearmanBundle\Service\GearmanClient;
use Mmoreram\GearmanBundle\Service\GearmanExecute;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Filesystem\LockHandler;

/**
 * Class GenerateHtmlCommand
 * @package GovWiki\GeneratorBundle\Command
 */
class GenerateHtmlCommand extends ContainerAwareCommand
{

    const DESCRIPTION = <<< EOF
Generate html page for each Governments and Elected Officials in specified environment.
EOF;

    const WORKER_COUNT = 6;

    /**
     * Configures the current command.
     *
     * @return void
     */
    protected function configure()
    {
        $this
            ->setName('govwiki:generate:html')
            ->setDescription(self::DESCRIPTION)
            ->addArgument(
                'domain',
                InputArgument::REQUIRED,
                'Environment domain'
            );
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
     */
    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $domain = $input->getArgument('domain');

        $lock = new LockHandler('generate_page');
        if (! $lock->lock()) {
            $output->writeln('This command already run.');
            return 1;
        }

        try {
            /** @var EntityManagerInterface $em */
            $em = $this->getContainer()->get('doctrine.orm.default_entity_manager');
            /** @var EnvironmentRepository $repository */
            $repository = $em->getRepository('GovWikiDbBundle:Environment');
            $environment = $repository->getByDomain($domain);

            $output->write('Start processing ... ');
            if ($this->process($environment)) {
                $output->writeln('[ <info>OK</info> ]');
            } else {
                $output->writeln('[ <info>ERROR</info> ]');
            }
        } catch (\Exception $e) {
            $output->writeln('<error>'. $e->getMessage() .'</error>');
            return 1;
        } finally {
            $lock->release();
        }

        return 0;
    }

    /**
     * @param Environment $environment A Environment entity instance.
     *
     * @return \Generator
     */
    protected function getGovernments(Environment $environment)
    {
        /** @var EntityManagerInterface $em */
        $em = $this->getContainer()->get('doctrine.orm.default_entity_manager');
        /** @var GovernmentRepository $repository */
        $repository = $em->getRepository('GovWikiDbBundle:Government');
        /** @var GovernmentManagerInterface $manager */
        $manager = $this->getContainer()
            ->get(GovWikiEnvironmentService::GOVERNMENT_MANAGER);

        $iterate = $repository->getListQuery($environment->getId())
            ->select('Government.id, Government.altTypeSlug, Government.slug')
            ->getQuery()
            ->iterate();

        foreach ($iterate as $object) {
            $object = current($object);

            // Get available years.
            $years = $manager->getAvailableYears($environment, $object['id']);
            $object['years'] = $years;

            yield $object;
            $em->clear();
        }
    }

    /**
     * @param Environment $environment A Environment entity instance.
     *
     * @return \Generator
     */
    protected function getElecteds(Environment $environment)
    {
        /** @var EntityManagerInterface $em */
        $em = $this->getContainer()->get('doctrine.orm.default_entity_manager');
        /** @var ElectedOfficialRepository $repository */
        $repository = $em->getRepository('GovWikiDbBundle:ElectedOfficial');

        $iterate = $repository->getListQuery($environment->getSlug())
            ->select(
                'Government.altTypeSlug, Government.slug',
                'eo.slug AS electedSlug'
            )
            ->getQuery()
            ->iterate();

        foreach ($iterate as $object) {
            $object = current($object);

            yield $object;
            $em->clear();
        }
    }

    /**
     * @param Environment $environment A processed environment entity.
     *
     * @return boolean
     */
    private function process(Environment $environment)
    {
        /** @var EntityManagerInterface $em */
        $em = $this->getContainer()->get('doctrine.orm.default_entity_manager');
        /** @var PidPoolFactory $pidPoolFactory */
        $pidPoolFactory = $this->getContainer()
            ->get(GovWikiGeneratorService::PID_POOL_FACTORY);

        $pidPool = $pidPoolFactory->create('html_generator');
        $pidPool
            ->restore()
            ->sendSignal(SIGKILL)
            ->clear();

        /** @var GearmanExecute $executor */
        $executor = $this->getContainer()->get('gearman.execute');

        for ($i = 0; $i < self::WORKER_COUNT; ++$i) {
            $workerName = (($i % 2) ? 'Government' : 'Elected')
                . 'Generator';
            $pid = pcntl_fork();
            if ($pid) {
                $pidPool->add($pid);
            } else {
                $executor->executeWorker($workerName);
            }
        }

        // Store all childs pids.
        $pidPool->store();

        // Reopen db connection.
        $conn = $em->getConnection();
        $conn->close();
        $conn->connect();

        /** @var GearmanClient $client */
        $client = $this->getContainer()->get('gearman');

        // Get governments.
        $governments = $this->getGovernments($environment);
        $electeds = $this->getElecteds($environment);

        foreach ($governments as $government) {
            $government['environment'] = $environment->getId();

            $payload = serialize($government);
            $client->addTask('GovernmentGenerator~generate', $payload);
        }

        foreach ($electeds as $elected) {
            $elected['environment'] = $environment->getId();

            $payload = serialize($elected);
            $client->addTask('ElectedGenerator~generate', $payload);
        }

        $em->clear();
        $conn->close();

        $result = $client->runTasks();

        // Close childs process.
        $pidPool
            ->sendSignal(SIGKILL)
            ->clear();

        return $result;
    }
}
