<?php

namespace GovWiki\DbBundle\Command;

use GovWiki\AdminBundle\GovWikiAdminServices;
use GovWiki\AdminBundle\Manager\AdminEnvironmentManager;
use GovWiki\DbBundle\Entity\CreateRequest;
use GovWiki\DbBundle\Entity\Environment;
use GovWiki\DbBundle\Entity\Format;
use GovWiki\DbBundle\GovWikiDbServices;
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

        $data = $em->createQueryBuilder()
            ->from('GovWikiDbBundle:CreateRequest', 'CreateRequest')
            ->select('CreateRequest')
            ->getQuery()
            ->getResult();

        $manager = $this->getContainer()->get(GovWikiDbServices::CREATE_REQUEST_MANAGER);

        $em->createQuery('DELETE FROM GovWikiRequestBundle:AbstractCreateRequest')
        ->execute();

        /** @var CreateRequest $row */
        foreach ($data as $row) {
            $fields = $row->getFields();
            dump($fields);
            try {
                /** @var  $entity */
                $entity = $manager->process([
                    'entityName' => $row->getEntityName(),
                    'user' => $row->getUser()->getId(),
                    'fields' => $fields,
                ], $row->getEnvironment());
            } catch (\Exception $e) {
                $em->remove($row);
                continue;
            }

            $em->persist($entity);
        }

        $em->flush();
    }
}
