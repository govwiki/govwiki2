<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * 20150826191608
 */
class Version20150826191608 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE contributions (id INT AUTO_INCREMENT NOT NULL, elected_official_id INT DEFAULT NULL, election_year INT DEFAULT NULL, contributor_name VARCHAR(255) DEFAULT NULL, independent_expenditure_desc VARCHAR(255) DEFAULT NULL, contribution_amount DOUBLE PRECISION DEFAULT NULL, contributor_type VARCHAR(255) DEFAULT NULL, INDEX IDX_76391EFEC10A9183 (elected_official_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('ALTER TABLE contributions ADD CONSTRAINT FK_76391EFEC10A9183 FOREIGN KEY (elected_official_id) REFERENCES elected_officials (id)');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('DROP TABLE contributions');
    }
}
