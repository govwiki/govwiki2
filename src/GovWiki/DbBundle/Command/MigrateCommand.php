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
        $environmentsArray = [];
        foreach ($environments as $environment) {
            $output->writeln("Process environment '{$environment->getName()}'");

            $environmentName = $environment->getSlug();

            $formats = $environment->getFormats();
            $manager->changeEnvironment($environmentName);
            $manager->createGovernmentTable($environmentName);

            $environmentsArray[$environmentName] = [];

            /** @var Format $format */
            foreach ($formats as $format) {
                $name = $format->getField();
                $name = str_replace('_', ' ', $name);
                $name = preg_replace('#(?(?! )([A-Z]|[0-9]+))#', ' $1', $name);

                $format->setName($name);
                $format->setField(str_replace([' ', '-'], '_', strtolower($name)));
                $format->setType('integer');

                $em->persist($format);
                $manager->addColumnToGovernment($format->getField(), 'integer');
                $environmentsArray[$environmentName][] = $format->getField();

                if ($format->isRanked()) {
                    $manager->addColumnToGovernment($format->getField(). '_rank', 'integer');
                    $environmentsArray[$environmentName][] = $format->getField().'_rank';
                }
                $em->flush();
            }
        }

        /*
         * Migrate governments.
         */
        $con = $em->getConnection();
        foreach ($environmentsArray as $environmentName => $fields) {
            /*
             * Migrate environment depended data.
             */
            $fields = implode(',', $fields);
            $con->exec("
                INSERT INTO {$environmentName} ({$fields})
                SELECT {$fields} FROM governments_old g
                INNER JOIN environments e ON g.environment_id = e.id
                WHERE e.slug = '{$environmentName}'
            ");

            /*
             * Create link between environment depended data and general data.
             */
            $ids = $con->fetchAll("
                SELECT og.id FROM governments_old og
                INNER JOIN environments e ON og.environment_id = e.id
                WHERE e.slug = '{$environmentName}'
            ");
            $envIds = $con->fetchAll("
                SELECT id FROM {$environmentName}
            ");
            $count = count($ids);

            for ($i = 0; $i < $count; ++$i) {
                $output->writeln("Process $i record");
                $con->exec("
                    UPDATE {$environmentName}
                    SET
                        government_id = {$ids[$i]['id']}
                    WHERE id = ". $envIds[$i]['id']
                );
            }
        }
    }
}
