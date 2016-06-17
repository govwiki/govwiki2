<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160606104206 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE survey_responses (id INT AUTO_INCREMENT NOT NULL, elected_official_id INT DEFAULT NULL, survey_title VARCHAR(255) NOT NULL, responses LONGTEXT NOT NULL COMMENT \'(DC2Type:array)\', survey_id VARCHAR(255) NOT NULL, INDEX IDX_9409DDB9C10A9183 (elected_official_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('ALTER TABLE survey_responses ADD CONSTRAINT FK_9409DDB9C10A9183 FOREIGN KEY (elected_official_id) REFERENCES elected_officials (id)');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('DROP TABLE survey_responses');
    }
}
