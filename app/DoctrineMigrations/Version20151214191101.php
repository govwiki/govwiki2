<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20151214191101 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE environments DROP FOREIGN KEY FK_CE28A831D629F605');
        $this->addSql('DROP INDEX UNIQ_CE28A831D629F605 ON environments');
        $this->addSql('ALTER TABLE environments DROP format_id');
        $this->addSql('ALTER TABLE formats ADD environment_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE formats ADD CONSTRAINT FK_DBCBA3C903E3A94 FOREIGN KEY (environment_id) REFERENCES environments (id)');
        $this->addSql('CREATE INDEX IDX_DBCBA3C903E3A94 ON formats (environment_id)');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE environments ADD format_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE environments ADD CONSTRAINT FK_CE28A831D629F605 FOREIGN KEY (format_id) REFERENCES formats (id)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_CE28A831D629F605 ON environments (format_id)');
        $this->addSql('ALTER TABLE formats DROP FOREIGN KEY FK_DBCBA3C903E3A94');
        $this->addSql('DROP INDEX IDX_DBCBA3C903E3A94 ON formats');
        $this->addSql('ALTER TABLE formats DROP environment_id');
    }
}
