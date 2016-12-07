<?php

namespace GovWiki\GeneratorBundle\Command;

use Amp\Process;
use Doctrine\ORM\EntityManagerInterface;
use GovWiki\DbBundle\Entity\Environment;
use GovWiki\DbBundle\Entity\Repository\EnvironmentRepository;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Filesystem\LockHandler;

/**
 * Class CopyHtmlCommand
 * @package GovWiki\GeneratorBundle\Command
 */
class CopyHtmlCommand extends ContainerAwareCommand
{

    const DESCRIPTION = <<< EOF
Copy generated html pages for specified environment.
EOF;

    /**
     * Configures the current command.
     *
     * @return void
     */
    protected function configure()
    {
        $this
            ->setName('govwiki:copy:html')
            ->setDescription(self::DESCRIPTION)
            ->addArgument(
                'domain',
                InputArgument::REQUIRED,
                'Environment domain'
            )
            ->addArgument('host', InputArgument::REQUIRED)
            ->addArgument('port', InputArgument::REQUIRED)
            ->addArgument('username', InputArgument::REQUIRED)
            ->addArgument('password', InputArgument::REQUIRED)
            ->addArgument('path', InputArgument::REQUIRED);
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
        $parameters = $input->getArguments();
        $domain = $parameters['domain'];
        unset($parameters['domain']);

        $lock = new LockHandler('copy_page');
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

            \Amp\run(function () use ($environment, $parameters) {
                /** @var LoggerInterface $logger */
                $logger = $this->getContainer()->get('monolog.logger.copy');

                $logger->info('Start at '. date('Y-m-d H:i:s'));
                $logger->info('Compress files ... ');
                $promises = [
                    $this->runProcess($environment, 'government'),
                    $this->runProcess($environment, 'elected'),
                ];

                $promises = array_filter($promises);

                \Amp\all($promises)->when(function () use ($logger, $environment, $parameters) {
                    $logger->info('Copy files ... ');
                    $governmentFileName = $this->getGzipFileName(
                        $environment,
                        'government'
                    );
                    $governmentPath = $this
                        ->getDestPath($environment, 'government');

                    $electedFileName = $this->getGzipFileName(
                        $environment,
                        'elected'
                    );
                    $electedPath = $this
                        ->getDestPath($environment, 'elected');

                    try {
                        $connection = $this->connectToFtp($parameters);

                        ftp_put(
                            $connection,
                            $parameters['path'] . $governmentFileName,
                            $governmentPath,
                            FTP_BINARY
                        );
                        ftp_put(
                            $connection,
                            $parameters['path'] . $electedFileName,
                            $electedPath,
                            FTP_BINARY
                        );

                        $logger->info('Done at '. date('Y-m-d H:i:s'));
                    } catch (\Exception $e) {
                        $logger->error($e->getMessage());
                        if ($connection) {
                            ftp_close($connection);
                        }
                    }
                });
            });
        } finally {
            $lock->release();
        }

        return 0;
    }

    /**
     * @param Environment $environment A Environment entity instance.
     * @param string      $entity      A generated entity name.
     *
     * @return \Amp\Promise
     */
    private function runProcess(Environment $environment, $entity)
    {
        $srcPath = $this->getSrcPath($environment, $entity);
        if (! $srcPath) {
            return null;
        }
        $destPath = $this->getDestPath($environment, $entity);

        $process = new Process("tar czf {$destPath} -C {$srcPath} .");

        return $process->exec();
    }

    /**
     * @param Environment $environment A Environment entity instance.
     * @param string      $entity      A generated entity name.
     *
     * @return string
     */
    private function getSrcPath(Environment $environment, $entity)
    {
        return trim(realpath($this->getContainer()
            ->getParameter($entity .'_generation_output') .'/'
                . $environment->getSlug()));
    }

    /**
     * @param Environment $environment A Environment entity instance.
     * @param string      $entity      A generated entity name.
     *
     * @return string
     */
    private function getDestPath(Environment $environment, $entity)
    {
        return realpath($this->getContainer()
            ->getParameter('static_generation_output'))
                .'/'. $this->getGzipFileName($environment, $entity);
    }


    /**
     * @param Environment $environment A Environment entity instance.
     * @param string      $entity      A generated entity name.
     *
     * @return string
     */
    private function getGzipFileName(Environment $environment, $entity)
    {
        return $environment->getSlug() ."_{$entity}s.tgz";
    }

    /**
     * @param array $parameters Ftp connection configuration.
     *
     * @return null|resource
     */
    private function connectToFtp(array $parameters)
    {
        $connection = ftp_connect($parameters['host'], $parameters['port']);
        $loggedIn = ftp_login(
            $connection,
            $parameters['username'],
            $parameters['password']
        );
        if (! $connection || ! $loggedIn) {
            return null;
        }

        ftp_pasv($connection, true);

        return $connection;
    }
}
