<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160302131226 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        $this->addSql('CREATE TABLE environment_styles (id INT AUTO_INCREMENT NOT NULL, environment_id INT DEFAULT NULL, name VARCHAR(255) NOT NULL, class_name VARCHAR(255) NOT NULL, properties VARCHAR(255) NOT NULL, INDEX IDX_CF8195D9903E3A94 (environment_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('ALTER TABLE environment_styles ADD CONSTRAINT FK_CF8195D9903E3A94 FOREIGN KEY (environment_id) REFERENCES environments (id)');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        $this->addSql('DROP TABLE environment_styles');
    }
}
