<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160323203148 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE environments ADD logo_href VARCHAR(255) DEFAULT NULL');

        // Add links for California and Puerto Rico.
        $this->addSql("
            UPDATE environments
            SET logo_href = 'http://californiapolicycenter.org/'
            WHERE slug = 'california'
        ");

        $this->addSql("
            UPDATE environments
            SET logo_href = 'http://www.cipp-pr.org/'
            WHERE slug = 'puerto_rico'
        ");
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE environments DROP logo_href');
    }
}
