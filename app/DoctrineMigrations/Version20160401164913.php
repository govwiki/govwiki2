<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160401164913 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('
            UPDATE documents d
            JOIN governments g ON g.id = d.government_id
            SET year = 2013
            WHERE g.environment_id = 9
        ');

        $this->addSql("
            INSERT INTO documents
            (government_id, type, link, created_at, year)
            SELECT
                government_id,
                'audit',
                audit_url,
                NOW(),
                2014
            FROM puerto_rico
            WHERE year = 2014
        ");
        $this->addSql('ALTER TABLE documents ADD CONSTRAINT FK_A2B07288F55836AA FOREIGN KEY (government_id) REFERENCES governments (id)');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE documents DROP FOREIGN KEY FK_A2B07288F55836AA');
    }
}
