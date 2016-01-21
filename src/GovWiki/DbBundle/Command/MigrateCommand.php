<?php

namespace GovWiki\DbBundle\Command;

use GovWiki\AdminBundle\GovWikiAdminServices;
use GovWiki\AdminBundle\Manager\AdminEnvironmentManager;
use GovWiki\DbBundle\Entity\Environment;
use GovWiki\DbBundle\Entity\Format;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

/**
 * MigrateCommand
 */
class MigrateCommand extends ContainerAwareCommand
{
    /**
     * Configure
     */
    protected function configure()
    {
        $this
            ->setName('db:migrate')
            ->setDescription('Load data to db from json files');
    }

    /**
     * Execute
     *
     * @param InputInterface  $input
     * @param OutputInterface $output
     */
    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $em = $this->getContainer()->get('doctrine.orm.default_entity_manager');

        $qb = $em->createQueryBuilder()
            ->select('Environment, Format')
            ->from('GovWikiDbBundle:Environment', 'Environment');

        /** @var Environment[] $environments */
        $environments = $qb
            ->innerJoin('Environment.formats', 'Format')
            ->getQuery()
            ->getResult();

        /** @var AdminEnvironmentManager $manager */
        $manager = $this->getContainer()
            ->get(GovWikiAdminServices::ADMIN_ENVIRONMENT_MANAGER);

        /*
         * Migrate formats.
         */
        foreach ($environments as $environment) {
            $output->writeln("Process environment '{$environment->getName()}'");

            $environmentName = $environment->getSlug();

            $formats = $environment->getFormats();
            $manager->changeEnvironment($environmentName);

            /** @var Format $format */
            foreach ($formats as $format) {
                $oldFieldName = $format->getField();
                $format->setField(Format::slugifyName($format->getName()));

                $em->persist($format);

                $manager->changeColumnInGovernment($oldFieldName, $format->getField(), $format->getType());

                if ($format->isRanked()) {
                    $manager->changeColumnInGovernment($oldFieldName.'_rank', $format->getField().'_rank', 'integer');
                }
                $em->flush();
            }
        }
    }
}
