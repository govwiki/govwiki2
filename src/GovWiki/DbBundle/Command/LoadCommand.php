<?php

namespace GovWiki\DbBundle\Command;

use CartoDbBundle\CartoDbServices;
use Doctrine\ORM\EntityManagerInterface;
use GovWiki\AdminBundle\Util\GeoJsonStreamListener;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

/**
 * LoadCommand
 */
class LoadCommand extends ContainerAwareCommand
{
    /**
     * {@inheritdoc}
     */
    protected function configure()
    {
        $this
            ->setName('govwiki:load')
            ->setDescription('Load data to environment government from geojson files')
            ->addArgument(
                'environment',
                InputArgument::REQUIRED,
                'Entity name'
            )
            ->addArgument(
                'pathToJson',
                InputArgument::REQUIRED,
                'Path to json'
            )
        ;
    }

    /**
     * {@inheritdoc}
     */
    protected function execute(InputInterface $input, OutputInterface $output)
    {
        /** @var EntityManagerInterface $em */
        $em = $this->getContainer()->get('doctrine')->getManager();

        $environmentName = $input->getArgument('environment');
        $environment = $em->getRepository('GovWikiDbBundle:Environment')
            ->getByName($environmentName);

        if (null === $environment) {
            $output->writeln(
                "<error>Can't find environment {$environmentName}</error>"
            );
            return 1;
        }

        $pathToJson = $input->getArgument('pathToJson');

        $output->writeln('<info>Start...</info>');

        $stream = fopen($pathToJson, 'r');
        $listener = new GeoJsonStreamListener(
            $em,
            $this->getContainer()->get(CartoDbServices::CARTO_DB_API),
            $environment
        );
        $parser = new \JsonStreamingParser_Parser($stream, $listener);
        $parser->parse();

        $output->writeln('<info>Finish!</info>');
        return 0;
    }
}
