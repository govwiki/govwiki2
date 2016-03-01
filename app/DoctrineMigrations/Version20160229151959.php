<?php

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\DBAL\Migrations\AbstractMigration;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use GovWiki\DbBundle\Entity\Adverting;

/**
 * Class Version20160229151959
 * @package Application\Migrations
 */
class Version20160229151959 extends AbstractMigration implements ContainerAwareInterface
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
        $this->addSql('CREATE TABLE adverting (id INT AUTO_INCREMENT NOT NULL, adverting_type VARCHAR(255) NOT NULL, adverting_enable TINYINT(1) NOT NULL, adverting_code LONGTEXT NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        $this->addSql('DROP TABLE adverting');
    }

    /**
     * Post up
     *
     * @param Schema $schema
     */
    public function postUp(Schema $schema)
    {
        $em = $this->container->get('doctrine.orm.entity_manager');

        $adverting = new Adverting();
        $adverting->setAdvertingCode('-- Google code --');
        $adverting->setAdvertingType('google_adsense');
        $em->persist($adverting);

        $em->flush();
    }
}
