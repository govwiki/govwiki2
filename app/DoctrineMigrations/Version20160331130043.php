<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160331130043 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE documents (id INT AUTO_INCREMENT NOT NULL, government_id INT DEFAULT NULL, name VARCHAR(255) DEFAULT NULL, type VARCHAR(255) NOT NULL, link VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, year INT NOT NULL, INDEX IDX_A2B07288F55836AA (government_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');

        // Migrate latest audit from governments to documents.
        $this->addSql("
            INSERT INTO documents
            (type, government_id, link, created_at, year)
            SELECT
                'audit',
                id,
                latest_audit_url,
                NOW(),
                2014
            FROM governments
            WHERE latest_audit_url IS NOT NULL
        ");

        $this->addSql('ALTER TABLE governments DROP latest_audit_url');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE governments ADD latest_audit_url VARCHAR(255) DEFAULT NULL');

        // Migrate latest audit from documents back to government.
        $this->addSql("
            UPDATE governments g
            INNER JOIN documents d ON g.id = d.government_id
            SET
                g.latest_audit_url = d.link
            WHERE d.type = 'audit'
        ");

        $this->addSql('DROP TABLE documents');
    }
}
