<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20151207135642 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE maps (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(255) NOT NULL, center varchar(255) NOT NULL, zoom INT NOT NULL, width INT NOT NULL, height INT NOT NULL, style LONGTEXT NOT NULL COMMENT \'(DC2Type:array)\', PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('ALTER TABLE governments ADD map_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE governments ADD CONSTRAINT FK_CD73189153C55F64 FOREIGN KEY (map_id) REFERENCES maps (id)');
        $this->addSql('CREATE INDEX IDX_CD73189153C55F64 ON governments (map_id)');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE governments DROP FOREIGN KEY FK_CD73189153C55F64');
        $this->addSql('DROP TABLE maps');
        $this->addSql('DROP INDEX IDX_CD73189153C55F64 ON governments');
        $this->addSql('ALTER TABLE governments DROP map_id');
    }
}
