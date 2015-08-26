<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * 20150826192206
 */
class Version20150826192206 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE endorsements (id INT AUTO_INCREMENT NOT NULL, elected_official_id INT DEFAULT NULL, name_of_endorser VARCHAR(255) NOT NULL, endorser_type VARCHAR(255) NOT NULL, election_year INT NOT NULL, INDEX IDX_54D08617C10A9183 (elected_official_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('ALTER TABLE endorsements ADD CONSTRAINT FK_54D08617C10A9183 FOREIGN KEY (elected_official_id) REFERENCES elected_officials (id)');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('DROP TABLE endorsements');
    }
}
