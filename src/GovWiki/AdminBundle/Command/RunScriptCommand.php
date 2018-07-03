<?php

namespace GovWiki\AdminBundle\Command;

use GovWiki\AdminBundle\Entity\Repository\ScriptQueueItemRepository;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Filesystem\LockHandler;
use Symfony\Component\Process\Process;

/**
 * Class DocumentIndexInitializeCommand
 *
 * @package GovWiki\AdminBundle\Command
 */
class RunScriptCommand extends Command
{

    const NAME = 'govwiki:script:run';

    /**
     * @var ScriptQueueItemRepository
     */
    private $repository;

    /**
     * RunScriptCommand constructor.
     *
     * @param ScriptQueueItemRepository $repository A ScriptQueueItemRepository
     *                                              instance.
     */
    public function __construct(ScriptQueueItemRepository $repository)
    {
        parent::__construct(self::NAME);
        $this->repository = $repository;
    }

    /**
     * Configures the current command.
     *
     * @return void
     */
    protected function configure()
    {
        $this->setDescription('Run queued scripts');
    }

    /**
     * {@inheritdoc}
     *
     * @return integer
     */
    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $lock = new LockHandler(self::NAME);

        try {
            if (! $lock->lock()) {
                $output->writeln('<error>Scripts is already executing</error>');

                return 1;
            }

            $queuedScripts = $this->repository->pull(10);

            if (\count($queuedScripts) > 0) {
                $output->writeln('Run scripts ...');
            } else {
                $output->writeln('Nothing to run ...');

                return 0;
            }

            foreach ($queuedScripts as $queuedScript) {
                $executable = $queuedScript->getScript()->getExecutable();

                $output->writeln(\sprintf(
                    "<info>\t> %s</info>",
                    $executable
                ));
                $process = new Process($executable);
                $process->run();

                $output->writeln("<info>\t  Script output:</info>");
                $output->writeln(\sprintf("\t  \"%s\"", $process->getOutput()));
            }
        } finally {
            $lock->release();
        }

        return 0;
    }
}
