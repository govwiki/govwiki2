<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160620130901 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE issues ADD request_id INT DEFAULT NULL, DROP state');
        $this->addSql('ALTER TABLE issues ADD CONSTRAINT FK_DA7D7F83427EB8A5 FOREIGN KEY (request_id) REFERENCES create_requests (id)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_DA7D7F83427EB8A5 ON issues (request_id)');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE issues DROP FOREIGN KEY FK_DA7D7F83427EB8A5');
        $this->addSql('DROP INDEX UNIQ_DA7D7F83427EB8A5 ON issues');
        $this->addSql('ALTER TABLE issues ADD state VARCHAR(255) DEFAULT NULL, DROP request_id');
    }
}
