<?php

namespace GovWiki\EnvironmentBundle\Command;

use Doctrine\DBAL\Connection;
use Doctrine\ORM\EntityManagerInterface;
use GovWiki\DbBundle\Entity\Environment;
use GovWiki\DbBundle\Entity\Repository\EnvironmentRepository;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Question\ConfirmationQuestion;
use Symfony\Component\Console\Question\Question;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;

/**
 * Class GeneratePensionsCommand
 * @package GovWiki\EnvironmentBundle\Command
 */
class GeneratePensionsCommand extends ContainerAwareCommand
{

    const DESCRIPTION = <<< EOF
Generate pensions table for california environment.
Use tc_pensions table.
EOF;

    const HUMAN_DEFAULT_PATH = './human.html';
    const BOT_DEFAULT_PATH = './bot.html';
    const CSV_DEFAULT_PATH = './tc_pensions.csv';

    private $fields = [
        'employee_name' => [
            'title' => 'Employee name',
            'type' => 'string',
        ],
        'job_title' => [
            'title' => 'Job Title',
            'type' => 'string',
        ],
        'employer' => [
            'title' => 'Employer',
            'type' => 'string',
        ],
        'pension_system' => [
            'title' => 'Pension System',
            'type' => 'string',
        ],
        'region' => [
            'title' => 'Region',
            'type' => 'string',
        ],
        'pension_amount' => [
            'title' => 'Pension Amount',
            'type' => 'number',
        ],
        'benefits_amount' => [
            'title' => 'Benefits Amount',
            'type' => 'number',
        ],
        'disability_amount' => [
            'title' => 'Disability Amount',
            'type' => 'number',
        ],
        'total_amount' => [
            'title' => 'Total Amount',
            'type' => 'number',
        ],
        'notes' => [
            'title' => 'Notes',
            'type' => 'string',
        ],
        'total_net_of_one_time_payments' => [
            'title' => 'Total Net Of One Time Payment',
            'type' => 'number',
        ],
        'years_of_service' => [
            'title' => 'Years Of Service',
            'type' => 'number',
        ],
        'year_of_retirement' => [
            'title' => 'Year Of Retirement',
            'type' => 'number',
        ],
        'year' => [
            'title' => 'Year',
            'type' => 'number',
        ],
    ];

    /**
     * Configures the current command.
     *
     * @return void
     */
    protected function configure()
    {
        $this
            ->setName('govwiki:generate:pensions')
            ->setDescription(self::DESCRIPTION)
            ->addOption(
                'debug',
                'd',
                InputOption::VALUE_NONE,
                'Debug generation'
            )
            ->addOption(
                'human',
                null,
                InputOption::VALUE_REQUIRED,
                'Path to output file for ordinary user, default: '. self::HUMAN_DEFAULT_PATH,
                self::HUMAN_DEFAULT_PATH
            )
            ->addOption(
                'for-human',
                null,
                InputOption::VALUE_NONE,
                'Generate table for ordinary users'
            )
            ->addOption(
                'bot',
                null,
                InputOption::VALUE_REQUIRED,
                'Path to output file for bots, default: '. self::BOT_DEFAULT_PATH,
                self::BOT_DEFAULT_PATH
            )
            ->addOption(
                'for-bot',
                null,
                InputOption::VALUE_NONE,
                'Generate table for bots'
            )
            ->addOption(
                'csv',
                null,
                InputOption::VALUE_NONE,
                'Generate csv data file'
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
        $forHuman = $input->getOption('for-human');
        $forBot = $input->getOption('for-bot');
        $generateCsv = $input->getOption('csv');

        $debug = $input->getOption('debug');
        $connection = null;

        if ($debug) {
            $connection = $this->connectToFtp($input, $output);
        }

        if ($forHuman &&
            ! $this->generateForHuman($input, $output, $connection)) {
            return 1;
        }

        if ($forBot &&
            ! $this->generateForBot($input, $output, $connection)) {
            return 1;
        }

        if ($generateCsv && $this->generateCsv($output, $connection)) {
            return 1;
        }

        return 0;
    }

    /**
     * Create generator for fetching data from tc_pensions table.
     *
     * @return \Generator
     *
     * @throws \Doctrine\DBAL\DBALException Error while fetching data.
     */
    private function getData()
    {
        /** @var Connection $connection */
        $connection = $this->getContainer()->get('database_connection');

        $stmt = $connection->query('
            SELECT
                employee_name, job_title, employer, pension_system, region,
                pension_amount, benefits_amount, disability_amount, total_amount,
                notes, total_net_of_one_time_payments, years_of_service,
                year_of_retirement, year
            FROM tc_pensions
        ');

        while (($data = $stmt->fetch(\PDO::FETCH_ASSOC)) !== false) {
            yield $data;
        }
    }

    /**
     * @param InputInterface  $input      A InputInterface instance.
     * @param OutputInterface $output     A OutputInterface instance.
     * @param resource        $connection A Ftp connection.
     *
     * @return boolean
     */
    private function generateForHuman(
        InputInterface $input,
        OutputInterface $output,
        $connection = null
    ) {
        $pathToHumanFile = $input->getOption('human');
        $debug = $input->getOption('debug');

        $message = '<info>Generate for ordinary users and save it to '
            . $pathToHumanFile
            . ' ... </info>';
        $output->write($message);

        // Get california environment and generate api endpoint for pensions table.
        /** @var EntityManagerInterface $em */
        $em = $this->getContainer()->get('doctrine.orm.default_entity_manager');
        /** @var EnvironmentRepository $repository */
        $repository = $em->getRepository('GovWikiDbBundle:Environment');
        /** @var UrlGeneratorInterface $generator */
        $generator = $this->getContainer()->get('router');

        $environment = $repository->getByName('california');
        if (! $environment instanceof Environment) {
            $this->writeError($output, "Can't find california environment.");

            return false;
        }
        $endPoint = 'http://'. $environment->getDomain()
            . $generator->generate('govwiki_api_v1_pensiontable_index');

        try {
            $templating = $this->getContainer()->get('templating');
            $html = $templating->render(
                'GovWikiEnvironmentBundle::human.html.twig',
                [
                    'data' => $this->getData(),
                    'debug' => $debug,
                    'endPoint' => $endPoint,
                    'fields' => $this->fields,
                ]
            );

            file_put_contents($pathToHumanFile, $html);
        } catch (\Exception $exception) {
            $this->writeError($output, $exception->getMessage());

            return false;
        }

        $output->writeln('[ <info>ok</info> ]');

        if ($connection) {
            $output->write('Deploy to ftp server ... ');

            if (ftp_put($connection, 'human.html', realpath($pathToHumanFile), FTP_BINARY)) {
                $output->writeln('[ <info>ok</info> ]');
            } else {
                $output->writeln('[ <error>error</error> ]');
                return false;
            }
        }

        return true;
    }

    /**
     * @param InputInterface  $input      A InputInterface instance.
     * @param OutputInterface $output     A OutputInterface instance.
     * @param resource        $connection A Ftp connection.
     *
     * @return boolean
     */
    private function generateForBot(
        InputInterface $input,
        OutputInterface $output,
        $connection
    ) {
        $pathToBotsFile = $input->getOption('bot');
        $debug = $input->getOption('debug');

        $message = '<info>Generate for bots and save it to '
            . $pathToBotsFile
            . ' ... </info>';
        $output->write($message);

        try {
            $templating = $this->getContainer()->get('templating');
            $html = $templating->render(
                'GovWikiEnvironmentBundle::bot.html.twig',
                [
                    'data' => $this->getData(),
                    'debug' => $debug,
                    'fields' => $this->fields,
                ]
            );

            file_put_contents($pathToBotsFile, $html);
        } catch (\Exception $exception) {
            $this->writeError($output, $exception->getMessage());

            return false;
        }

        $output->writeln('[ <info>ok</info> ]');

        if ($connection) {
            $output->write('Deploy to ftp server ... ');

            if (ftp_put($connection, 'bot.html', realpath($pathToBotsFile), FTP_BINARY)) {
                $output->writeln('[ <info>ok</info> ]');
            } else {
                $output->writeln('[ <error>error</error> ]');
                return false;
            }
        }
        return true;
    }

    /**
     * @param OutputInterface $output     A OutputInterface instance.
     * @param resource        $connection A Ftp connection.
     *
     * @return boolean
     */
    private function generateCsv(
        OutputInterface $output,
        $connection
    ) {
        $pathToCsvFile = self::CSV_DEFAULT_PATH;

        $message = '<info>Generate csv data file and save it to '
            . self::CSV_DEFAULT_PATH
            . ' ... </info>';
        $output->write($message);
        $headAdded = false;

        $file = fopen($pathToCsvFile, 'w');

        $data = $this->getData();
        foreach ($data as $row) {
            if (! $headAdded) {
                fputcsv($file, array_keys($row), ',');
            }

            fputcsv($file, $row, ',');
        }

        fclose($file);
        $output->writeln('[ <info>ok</info> ]');

        if ($connection) {
            $output->write('Deploy to ftp server ... ');

            if (ftp_put($connection, 'tc_pensions.csv', realpath($pathToCsvFile), FTP_BINARY)) {
                $output->writeln('[ <info>ok</info> ]');
            } else {
                $output->writeln('[ <error>error</error> ]');
                return false;
            }
        }

        return true;
    }

    /**
     * @param InputInterface  $input  A InputInterface instance.
     * @param OutputInterface $output A OutputInterface instance.
     *
     * @return resource|null
     */
    private function connectToFtp(
        InputInterface $input,
        OutputInterface $output
    ) {
        $helper = $this->getHelper('question');

        $deployQuestion = new ConfirmationQuestion(
            'Deploy to server? ',
            true
        );

        if (! $helper->ask($input, $output, $deployQuestion)) {
            return null;
        }

        $serverQuestion = new Question('Ftp server (ftp.govwiki.info): ', 'ftp.govwiki.info');
        $portQuestion = new Question('Ftp server port (21): ', '21');
        $usernameQuestion = new Question('Username: ', '');
        $passwordQuestion = new Question('Password (input will be hidden): ', '');
        $passwordQuestion
            ->setHidden(true)
            ->setHiddenFallback(false);

        $server = trim($helper->ask($input, $output, $serverQuestion));
        $port = (int) $helper->ask($input, $output, $portQuestion);
        $username = trim($helper->ask($input, $output, $usernameQuestion));
        $password = trim($helper->ask($input, $output, $passwordQuestion));

        if (! $server || ! $port || ! $username || ! $password) {
            $this->writeError($output, 'Provide all data for ftp connection.');

            return null;
        }

        $connection = ftp_connect($server, $port);
        $loggedIn = ftp_login($connection, $username, $password);

        if (! $connection || ! $loggedIn) {
            $this->writeError($output, 'Invalid credentials.');
            return null;
        }

        ftp_pasv($connection, true);

        return $connection;
    }

    /**
     * @param OutputInterface $output  A OutputInterface instance.
     * @param string          $message Error message.
     *
     * @return void
     */
    private function writeError(OutputInterface $output, $message)
    {
        $output->writeln('[ <error>error</error> ]');
        $output->writeln('');
        $output->writeln(
            '<error>Error occurred: '. $message .'</error>'
        );
    }
}
