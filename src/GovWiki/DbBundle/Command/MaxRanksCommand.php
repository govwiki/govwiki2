<?php

namespace GovWiki\DbBundle\Command;

use GovWiki\DbBundle\GovWikiDbServices;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

/**
 * MaxRanksCommand
 */
class MaxRanksCommand extends ContainerAwareCommand
{
    /**
     * {@inheritdoc}
     */
    protected function configure()
    {
        $this
            ->setName('db:max-ranks')
            ->setDescription('Count max ranks.');
    }

    /**
     * Execute.
     *
     * @param InputInterface  $input  A InputInterface instance.
     * @param OutputInterface $output A OutputInterface instance.
     *
     * @return void
     */
    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $computer = $this->getContainer()->get(GovWikiDbServices::MAX_RANKS_COMPUTER);

        $computer->compute();
    }
}
