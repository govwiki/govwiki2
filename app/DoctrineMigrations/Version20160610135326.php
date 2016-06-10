<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160610135326 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE surveys (id INT AUTO_INCREMENT NOT NULL, environment_id INT DEFAULT NULL, title VARCHAR(255) NOT NULL, survey_id VARCHAR(255) NOT NULL, alt_types LONGTEXT NOT NULL COMMENT \'(DC2Type:array)\', INDEX IDX_AFA82EA7903E3A94 (environment_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('ALTER TABLE surveys ADD CONSTRAINT FK_AFA82EA7903E3A94 FOREIGN KEY (environment_id) REFERENCES environments (id)');
        $this->addSql('ALTER TABLE survey_responses DROP survey_title, CHANGE survey_id survey_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE survey_responses ADD CONSTRAINT FK_9409DDB9B3FE509D FOREIGN KEY (survey_id) REFERENCES surveys (id)');
        $this->addSql('CREATE INDEX IDX_9409DDB9B3FE509D ON survey_responses (survey_id)');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE survey_responses DROP FOREIGN KEY FK_9409DDB9B3FE509D');
        $this->addSql('DROP TABLE surveys');
        $this->addSql('DROP INDEX IDX_9409DDB9B3FE509D ON survey_responses');
        $this->addSql('ALTER TABLE survey_responses ADD survey_title VARCHAR(255) NOT NULL, CHANGE survey_id survey_id VARCHAR(255) NOT NULL');
    }
}
