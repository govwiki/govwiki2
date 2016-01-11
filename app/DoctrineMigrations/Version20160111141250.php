<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160111141250 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE governments ADD environment_id INT DEFAULT NULL, ADD data_id INT NOT NULL');
        $this->addSql('ALTER TABLE governments ADD CONSTRAINT FK_CD731891903E3A94 FOREIGN KEY (environment_id) REFERENCES environments (id)');
        $this->addSql('CREATE INDEX IDX_CD731891903E3A94 ON governments (environment_id)');
        $this->addSql('ALTER TABLE formats ADD name VARCHAR(255) NOT NULL');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE formats DROP name');
        $this->addSql('ALTER TABLE governments DROP FOREIGN KEY FK_CD731891903E3A94');
        $this->addSql('DROP INDEX IDX_CD731891903E3A94 ON governments');
        $this->addSql('ALTER TABLE governments DROP environment_id, DROP data_id');
    }
}
