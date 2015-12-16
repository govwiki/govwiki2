<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20151210191131 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE formats (id INT AUTO_INCREMENT NOT NULL, map_id INT DEFAULT NULL, category VARCHAR(255) NOT NULL, field VARCHAR(255) NOT NULL, description VARCHAR(255) NOT NULL, show_in LONGTEXT NOT NULL COMMENT \'(DC2Type:array)\', data_or_formula VARCHAR(255) NOT NULL, ranked TINYINT(1) NOT NULL, mask VARCHAR(255) NOT NULL, help_text LONGTEXT NOT NULL, INDEX IDX_DBCBA3C53C55F64 (map_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('ALTER TABLE formats ADD CONSTRAINT FK_DBCBA3C53C55F64 FOREIGN KEY (map_id) REFERENCES maps (id)');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('DROP TABLE formats');
    }
}
