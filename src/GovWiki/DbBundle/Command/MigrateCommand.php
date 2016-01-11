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
use GovWiki\DbBundle\Entity\Government;
use GovWiki\DbBundle\Entity\ElectedOfficial;
use GovWiki\DbBundle\Entity\ElectedOfficialVote;
use GovWiki\DbBundle\Entity\IssueCategory;
use GovWiki\DbBundle\Entity\Contribution;
use GovWiki\DbBundle\Entity\Endorsement;
use GovWiki\DbBundle\Entity\Fund;
use GovWiki\DbBundle\Entity\CaptionCategory;
use GovWiki\DbBundle\Entity\FinData;
use GovWiki\DbBundle\Entity\OpenEnrollmentSchool;
use GovWiki\DbBundle\Entity\TriggerSchool;
use GovWiki\DbBundle\Entity\Median;
use GovWiki\DbBundle\Entity\MaxRank;
use GovWiki\DbBundle\Entity\Legislation;
use GovWiki\DbBundle\Entity\PublicStatement;

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

        foreach ($environments as $environment) {
            $output->writeln("Process environment '{$environment->getName()}'");

            $formats = $environment->getFormats();
            $manager->changeEnvironment($environment->getSlug());
            $manager->createGovernmentTable($environment->getSlug());

            /** @var Format $format */
            foreach ($formats as $format) {
                $name = $format->getField();
                $name = str_replace('_', ' ', $name);
                $name = preg_replace('#([A-Z]|[0-9]+)#', ' $1', $name);

                $format->setName($name);
                $format->setField(str_replace([' ', '-'], '_', strtolower($name)));
                $format->setType('integer');

                $em->persist($format);
                $manager->addColumnToGovernment($format->getField(), 'integer');
                if ($format->isRanked()) {
                    $manager->addColumnToGovernment($format->getField(). '_rank', 'integer');
                }

                dump($format->getField());
                $em->flush();
            }
        }
    }
}
