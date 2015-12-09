<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20151209124336 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('DROP TABLE environments');
        $this->addSql('ALTER TABLE maps ADD name VARCHAR(255) NOT NULL, CHANGE center center varchar(255) NOT NULL');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE environments (id INT AUTO_INCREMENT NOT NULL, map_id INT DEFAULT NULL, name VARCHAR(255) NOT NULL, header LONGTEXT NOT NULL, footer LONGTEXT NOT NULL, home_text LONGTEXT NOT NULL, INDEX IDX_CE28A83153C55F64 (map_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('ALTER TABLE environments ADD CONSTRAINT FK_CE28A83153C55F64 FOREIGN KEY (map_id) REFERENCES maps (id)');
        $this->addSql('ALTER TABLE maps DROP name, CHANGE center center VARCHAR(255) NOT NULL');
    }
}
