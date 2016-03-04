<?php

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\DBAL\Migrations\AbstractMigration;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use GovWiki\DbBundle\Entity\Advertising;

/**
 * Class Version20160304151959
 * @package Application\Migrations
 */
class Version20160304151959 extends AbstractMigration implements ContainerAwareInterface
{
    /**
     * Container
     *
     * @var ContainerInterface
     */
    private $container;

    /**
     * Set container
     *
     * @param ContainerInterface|null $container
     */
    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        $this->addSql('DROP TABLE adverting');
        $this->addSql('CREATE TABLE advertising (id INT AUTO_INCREMENT NOT NULL, environment_id INT DEFAULT NULL, adverting_type VARCHAR(255) NOT NULL, adverting_enable TINYINT(1) NOT NULL, adverting_code LONGTEXT NOT NULL, INDEX IDX_50219E78903E3A94 (environment_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('ALTER TABLE advertising ADD CONSTRAINT FK_50219E78903E3A94 FOREIGN KEY (environment_id) REFERENCES environments (id)');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
    }

    /**
     * Post up
     *
     * @param Schema $schema
     */
    public function postUp(Schema $schema)
    {
        $em = $this->container->get('doctrine.orm.entity_manager');

        $environments = $em->getRepository("GovWikiDbBundle:Environment")->findAll();

        foreach ($environments as $environment) {
            $adverting = new Advertising();
            $adverting->setEnvironment($environment);
            $adverting->setAdvertingCode('-- Google code '.$environment->getName().' --');
            $adverting->setAdvertingType('google_adsense');
            $em->persist($adverting);
        }

        $em->flush();
    }
}
