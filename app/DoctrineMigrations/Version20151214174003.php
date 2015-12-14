<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20151214174003 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE edit_requests ADD environment_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE edit_requests ADD CONSTRAINT FK_508B7278903E3A94 FOREIGN KEY (environment_id) REFERENCES environments (id)');
        $this->addSql('CREATE INDEX IDX_508B7278903E3A94 ON edit_requests (environment_id)');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE edit_requests DROP FOREIGN KEY FK_508B7278903E3A94');
        $this->addSql('DROP INDEX IDX_508B7278903E3A94 ON edit_requests');
        $this->addSql('ALTER TABLE edit_requests DROP environment_id');
    }
}
