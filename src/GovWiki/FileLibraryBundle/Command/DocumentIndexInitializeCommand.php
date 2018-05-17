<?php

namespace GovWiki\FileLibraryBundle\Command;

use GovWiki\DbBundle\Entity\Environment;
use GovWiki\DbBundle\Entity\Repository\EnvironmentRepository;
use GovWiki\FileLibraryBundle\Storage\Adapter\AdapterFile;
use GovWiki\FileLibraryBundle\Storage\Storage;
use GovWiki\FileLibraryBundle\Storage\StorageFactory;
use Doctrine\ORM\EntityManagerInterface;
use MKraemer\ReactPCNTL\PCNTL;
use React\EventLoop\Factory;
use React\EventLoop\Timer\TimerInterface;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Lock\Factory as LockFactory;
use Symfony\Component\Lock\Store\SemaphoreStore;

/**
 * Class DocumentIndexInitializeCommand
 *
 * @package GovWiki\FileLibraryBundle\Command
 */
class DocumentIndexInitializeCommand extends AbstractParallelCommand
{

    const QUEUE_KEY = 11;

    const MSG_DIRECTORY = 12;
    const MSG_FILE = 13;

    const NAME = 'document:index:initialize';

    /**
     * @var StorageFactory
     */
    protected $factory;

    /**
     * @var EntityManagerInterface
     */
    protected $em;

    /**
     * @var Environment
     */
    protected $environment;

    /**
     * @var Storage
     */
    protected $storage;

    /**
     * @var LockFactory
     */
    protected $lockFactory;

    /**
     * IndexInitCommand constructor.
     *
     * @param StorageFactory         $factory A StorageFactory instance.
     * @param EntityManagerInterface $em      A EntityManagerInterface instance.
     */
    public function __construct(
        StorageFactory $factory,
        EntityManagerInterface $em
    ) {
        parent::__construct(static::NAME);

        $this->factory = $factory;
        $this->em = $em;
        $this->lockFactory = new LockFactory(new SemaphoreStore());
    }

    /**
     * Configures the current command.
     *
     * @return void
     */
    protected function configure()
    {
        parent::configure();
        $this
            ->setDescription('Index documents in remote storage.')
            ->addArgument('environment', InputArgument::REQUIRED, 'Used environment name');
    }

    /**
     * @param InputInterface  $input  A InputInterface instance.
     * @param OutputInterface $output A OutputInterface instance.
     *
     * @return void
     *
     * @SuppressWarnings(PHPMD.UnusedFormalParameter)
     */
    protected function doInitialize(InputInterface $input, OutputInterface $output)
    {
        $environmentName = \trim($input->getArgument('environment'));

        /** @var EnvironmentRepository $repository */
        $repository = $this->em->getRepository(Environment::class);
        $this->environment = $repository->getByName($environmentName);

        if ($this->environment === null) {
            $output->writeln(\sprintf('Environment with name "%s" not found', $environmentName));
        }

        $this->storage = $this->factory->createStorage($this->environment);
    }

    /**
     * @param resource        $queue  Processed queue.
     * @param OutputInterface $output A OutputInterface instance.
     *
     * @return void
     */
    protected function childProcess($queue, OutputInterface $output)
    {
        $this->em->getConnection()->close();
        $this->em->getConnection()->connect();

        $output->writeln('Started!');

        $stop = false;

        $loop = Factory::create();
        $pcntl = new PCNTL($loop);

        $pcntl->on(\SIGTERM, function () use (&$stop, $output) {
            $output->writeln('Got SIGTERM signal');
            $stop = true;
        });

        $pcntl->on(\SIGINT, function () use (&$stop, $output) {
            $output->writeln('Got SIGINT signal');
            $stop = true;
        });

        $loop->addPeriodicTimer(0.1, function (TimerInterface $timer) use (&$stop, $output, $queue) {
            if ($stop) {
                $output->writeln('Begin graceful stop');
                $timer->cancel();
                $timer->getLoop()->stop();
                return;
            }

            $msgtype = null;
            $err = null;
            $data = null;

            try {
                \msg_receive($queue, 0, $msgtype, 100000000, $data, true, MSG_IPC_NOWAIT, $err);

                switch ($err) {
                    case \MSG_ENOMSG:
                        return;

                    case 0:
                        break;

                    default:
                        $output->writeln(\sprintf('Can\'t get message. Error code: %d', $err));
                        return;
                }

                \array_unshift($data, $this->environment);

                switch ($msgtype) {
                    case self::MSG_DIRECTORY:
                        $output->writeln(\sprintf(
                            'Index directory "%s"',
                            $data[1]
                        ));
                        $this->storage->getIndex()->createDirectory(...$data);
                        break;

                    case self::MSG_FILE:
                        $output->writeln(\sprintf(
                            'Index file "%s"',
                            $data[1]
                        ));

                        $this->storage->getIndex()->createFile(...$data);
                        break;
                }

            } catch (\Throwable $exception) {
                self::printError($output, \sprintf(
                    'Got exception while processing file "%s"',
                    $data[1]
                ), $exception);
            }
        });

        $loop->run();

        $output->writeln('Stopped!');
        $this->storage->getIndex()->flush();
        exit(0);
    }

    /**
     * @param resource        $queue  Processed queue.
     * @param OutputInterface $output A OutputInterface instance.
     *
     * @return void
     */
    protected function mainProcess($queue, OutputInterface $output)
    {
        $this->em->getConnection()->close();
        $this->em->getConnection()->connect();

        $output->writeln('Clear index');
        $this->storage->getIndex()->clearIndex($this->environment);

        $output->writeln('Fetch files and directories list from storage and index them');
        $this->indexDirectory($queue, $output, '/');
    }

    /**
     * @param resource        $queue  Processed queue.
     * @param OutputInterface $output An OutputInterface instance.
     * @param string          $path   Path to indexed file.
     *
     * @return void
     */
    protected function indexDirectory($queue, OutputInterface $output, string $path)
    {
        $files = $this->storage->getAdapter()->listFiles($path);

        /** @var AdapterFile $file */
        foreach ($files as $file) {
            if ($file->isDirectory()) {
                self::waitUntilQueueIsEmpty($queue);
                \msg_send($queue, self::MSG_DIRECTORY, [ $file->getPath() ]);
                \usleep(5 * 100000);
                $this->indexDirectory($queue, $output, $file->getPath());
            } else {
                \msg_send($queue, self::MSG_FILE, [ $file->getPath(), $file->getSize() ]);
            }
        }
    }

    /**
     * @param OutputInterface $output    A OutputInterface instance.
     * @param string          $message   Message.
     * @param \Throwable      $exception A occurred exception.
     *
     * @return void
     */
    private static function printError(
        OutputInterface $output,
        string $message,
        \Throwable $exception
    ) {
        $output->writeln(\sprintf(
            '<error>%s: [%s] %s</error>',
            $message,
            \get_class($exception),
            $exception->getMessage()
        ));

        $previous = $exception->getPrevious();
        if ($previous !== null) {
            self::printError($output, $message, $previous);
        }
    }
}
