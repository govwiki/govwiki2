<?php

namespace GovWiki\DbBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

/**
 * ShiftGeoDataCommand
 */
class ShiftGeoDataCommand extends ContainerAwareCommand
{
    /**
     * Configure
     */
    protected function configure()
    {
        $this->setName('db:shift_geo_data')
             ->setDescription('Shift simmilar lat/lng for governments');
    }

    /**
     * Execute
     *
     * @param InputInterface  $input
     * @param OutputInterface $output
     */
    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $em = $this->getContainer()->get('doctrine')->getEntityManager();
        $governments = $em->getRepository('GovWikiDbBundle:Government')->findAll();

        $progress = $this->getHelper('progress');
        $progress->start($output, count($governments));

        $comparisonArray = [];
        foreach ($governments as $government) {
            $currentGeoData = "{$government->getLatitude()},{$government->getLongitude()}";

            while (in_array($currentGeoData, $comparisonArray, true)) {
                $government->setLatitude($government->getLatitude() + 0.01)->setLongitude($government->getLongitude() + 0.01);
                $currentGeoData = "{$government->getLatitude()},{$government->getLongitude()}";
            }

            $comparisonArray[] = $currentGeoData;

            $progress->advance();
        }

        $output->writeln("\r\n<info>Flush</info>");
        $em->flush();

        $output->writeln('<info>Finish!</info>');
    }
}
