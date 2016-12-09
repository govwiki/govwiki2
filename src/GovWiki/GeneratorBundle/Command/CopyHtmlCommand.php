<?php

namespace GovWiki\GeneratorBundle\Command;

use Doctrine\ORM\EntityManagerInterface;
use GovWiki\DbBundle\Entity\Environment;
use GovWiki\DbBundle\Entity\Repository\EnvironmentRepository;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Filesystem\LockHandler;
use Symfony\Component\Process\Process;

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
        /** @var LoggerInterface $logger */
        $logger = $this->getContainer()->get('monolog.logger.copy');
        $logger->info('Start at '. date('Y-m-d H:i:s'));

        try {
            /** @var EntityManagerInterface $em */
            $em = $this->getContainer()->get('doctrine.orm.default_entity_manager');
            /** @var EnvironmentRepository $repository */
            $repository = $em->getRepository('GovWikiDbBundle:Environment');

            $environment = $repository->getByDomain($domain);

            $archiveName = $environment->getSlug() . '.tgz';

            $dest = realpath($this->getContainer()
                ->getParameter('static_generation_output')) . '/'
                    . $archiveName;

            $src = realpath($this->getContainer()
                ->getParameter('static_generation_output') . '/'
                    . $environment->getSlug());

            $process = new Process("tar czf {$dest} -C {$src} .");
            $process->setTimeout(600);

            $logger->info("Start compressing {$src} ... ");
            $process->run();
            if ($process->getExitCode() > 0) {
                $logger->error("Can't compress");
                return 1;
            }

            $remotePath = rtrim($parameters['path'], '/') .'/'. $archiveName;

            $remote = $parameters['user'] .'@'. $parameters['host'] .':'
                . $remotePath;
            $logger->info("Copying compressed archive to {$remote} ... ");

            $connection = $this->connectToFtp($parameters);
            ftp_put(
                $connection,
                $remotePath,
                $dest,
                FTP_BINARY
            );

            $logger->info("Done at ". date('Y-m-d H:i:s'));
        } catch (\Exception $e) {
            $logger->error('Error: '. $e->getMessage());
        } finally {
            if (isset($connection)) {
                ftp_close($connection);
            }
            $lock->release();
        }

        return 0;
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
