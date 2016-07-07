<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160707152247 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE governments ADD web_site_address VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE formats ADD source VARCHAR(255) NOT NULL');
        $this->addSql("
            UPDATE formats
            SET
                source = 'user_defined'
        ");

        $environments = $this->connection->fetchAll("
            SELECT
                e.name
            FROM environments e
            JOIN formats f ON f.environment_id = e.id
            WHERE f.field = 'web_site_address'
            GROUP BY e.id;
        ");
        $environments = array_map(function (array $row) {
            return $row['name'];
        }, $environments);

        foreach ($environments as $environment) {
            $this->addSql("
                UPDATE governments g
                JOIN (
                    SELECT
                        government_id,
                        web_site_address
                    FROM {$environment} c
                    GROUP BY id
                ) x
                SET
                    g.web_site_address = x.web_site_address
                WHERE x.government_id = g.id;
            ");
        }

    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE governments DROP web_site_address');
    }
}
