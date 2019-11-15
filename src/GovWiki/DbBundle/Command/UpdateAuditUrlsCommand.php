<?php

namespace GovWiki\DbBundle\Command;

use Doctrine\ORM\EntityManager;
use GovWiki\DbBundle\Entity\Government;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Filesystem\LockHandler;

class UpdateAuditUrlsCommand extends ContainerAwareCommand
{
    public static $environments = ['puerto_rico'];
    const HOST_URL = 'http://www.govwiki.info';

    protected function configure()
    {
        $this
            ->setName('db:update-audit-urls')
            ->setDescription('Update audit URLs');
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $lock = new LockHandler('db:update-audit-urls');
        if (!$lock->lock()) {
            $output->writeln('This command is already running in another process.');
            return false;
        }

        /** @var EntityManager $manager */
        $manager = $this->getContainer()->get('doctrine.orm.entity_manager');

        foreach (self::$environments as $environment) {;
            $sql = "SELECT * FROM {$environment}";
            $stmt = $manager->getConnection()->prepare($sql);
            $stmt->execute();
            $manager->getConnection()->beginTransaction();
            try {
                while ($row = $stmt->fetch()) {
                    $government = $manager->getRepository(Government::class)->find($row['government_id']);
                    $link = self::HOST_URL .
                        "/Audits/{$government->getState()} {$government->getName()} {$row['year']}.pdf";
                    $manager
                        ->getConnection()
                        ->executeQuery("UPDATE {$environment} SET audit_url = '${link}' WHERE id = {$row['id']}");
                }

                $manager->getConnection()->commit();
            } catch (\Exception $e) {
                $manager->getConnection()->rollBack();
                $output->writeln("ERROR: {$e->getMessage()}");
            }
        }

        return true;
    }
}