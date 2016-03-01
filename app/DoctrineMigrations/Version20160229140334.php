<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160229140334 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE translations (id INT AUTO_INCREMENT NOT NULL, locale_id INT DEFAULT NULL, trans_key VARCHAR(255) NOT NULL, message_domain VARCHAR(255) NOT NULL, translation LONGTEXT NOT NULL, date_created DATETIME NOT NULL, date_updated DATETIME NOT NULL, trans_textarea_type VARCHAR(15) NOT NULL, INDEX IDX_C6B7DA87E559DFD1 (locale_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('CREATE TABLE locales (id INT AUTO_INCREMENT NOT NULL, environment_id INT DEFAULT NULL, short_name VARCHAR(5) NOT NULL, INDEX IDX_E59B54BB903E3A94 (environment_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('ALTER TABLE translations ADD CONSTRAINT FK_C6B7DA87E559DFD1 FOREIGN KEY (locale_id) REFERENCES locales (id)');
        $this->addSql('ALTER TABLE locales ADD CONSTRAINT FK_E59B54BB903E3A94 FOREIGN KEY (environment_id) REFERENCES environments (id)');
        $this->addSql('ALTER TABLE environments DROP greeting_text, DROP bottom_text, DROP show_bottom_text');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE translations DROP FOREIGN KEY FK_C6B7DA87E559DFD1');
        $this->addSql('DROP TABLE translations');
        $this->addSql('DROP TABLE locales');
        $this->addSql('ALTER TABLE environments ADD greeting_text LONGTEXT NOT NULL, ADD bottom_text LONGTEXT DEFAULT NULL, ADD show_bottom_text TINYINT(1) NOT NULL');
    }
}
