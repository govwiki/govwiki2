<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160524120852 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE issues (id INT AUTO_INCREMENT NOT NULL, government_id INT DEFAULT NULL, description LONGTEXT DEFAULT NULL, type VARCHAR(255) NOT NULL, link VARCHAR(255) NOT NULL, date DATE NOT NULL, INDEX IDX_DA7D7F83F55836AA (government_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');

        // Copy all data from `documents` to `issues`.
        $this->addSql('
            INSERT INTO `issues` (government_id, description, type, link, date)
            SELECT government_id, description, type, link, date
            FROM `documents`;
        ');

        $this->addSql('DROP TABLE `documents`');

        $this->addSql('ALTER TABLE `groups` ADD tab_type VARCHAR(21) DEFAULT NULL');

        // Set tab type for all tabs.
        $this->addSql("
            UPDATE `groups`
            SET tab_type = 'user_defined'
            WHERE type = 'tab'
        ");

        // Create 'Financial Statements' tab for all environments.
        $this->addSql("
            INSERT INTO `groups`
            (environment_id, name, order_number, type, tab_type)
            SELECT id, 'Financial Statements', 99, 'tab', 'financial_statements'
            FROM `environments`
        ");

        // Create 'Issues' tab for all environments.
        $this->addSql("
            INSERT INTO `groups`
            (environment_id, name, order_number, type, tab_type)
            SELECT
                id, 'Issues', 1, 'tab', 'issues'
            FROM environments
        ");

        // Create 'Salaries' tab.
        $this->addSql("
            INSERT INTO `groups`
            (environment_id, name, order_number, type, tab_type)
            SELECT
                id, 'Salaries', 1, 'tab', 'salaries'
            FROM environments
            WHERE slug = 'california'
        ");

        // Create 'Pensions' tab.
        $this->addSql("
            INSERT INTO `groups`
            (environment_id, name, order_number, type, tab_type)
            SELECT
                id, 'Pensions', 1, 'tab', 'pensions'
            FROM environments
            WHERE slug = 'california'
        ");
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');
        $this->addSql('CREATE TABLE `documents` (id INT AUTO_INCREMENT NOT NULL, government_id INT DEFAULT NULL, type VARCHAR(255) NOT NULL, link VARCHAR(255) NOT NULL, description LONGTEXT DEFAULT NULL, date DATE NOT NULL, INDEX IDX_A2B07288F55836AA (government_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('ALTER TABLE `documents` ADD CONSTRAINT FK_A2B07288F55836AA FOREIGN KEY (government_id) REFERENCES governments (id)');

        // Copy data back.
        $this->addSql('
            INSERT INTO `documents` (government_id, description, type, link, date)
            SELECT government_id, description, type, link, date
            FROM issues;
        ');

        $this->addSql('DROP TABLE `issues`');

        // Remove all created tab.
        $this->addSql("
            DELETE FROM `groups`
            WHERE tab_type != 'user_defined' AND
                type = 'tab'
        ");

        $this->addSql('ALTER TABLE `groups` DROP tab_type');
    }
}
