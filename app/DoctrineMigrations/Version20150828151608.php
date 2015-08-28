<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * 20150828151608
 */
class Version20150828151608 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE legislations (id INT AUTO_INCREMENT NOT NULL, gov_assigned_number VARCHAR(255) DEFAULT NULL, date_considered DATE DEFAULT NULL, name VARCHAR(255) DEFAULT NULL, summary VARCHAR(255) DEFAULT NULL, evaluator_approved_position VARCHAR(255) DEFAULT NULL, weighting INT DEFAULT NULL, notes LONGTEXT DEFAULT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('CREATE TABLE elected_officials_votes (id INT AUTO_INCREMENT NOT NULL, elected_official_id INT DEFAULT NULL, legislation_id INT DEFAULT NULL, vote VARCHAR(255) DEFAULT NULL, did_elected_official_propose_this TINYINT(1) DEFAULT NULL, INDEX IDX_15D0E5A5C10A9183 (elected_official_id), INDEX IDX_15D0E5A5C633199E (legislation_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('ALTER TABLE elected_officials_votes ADD CONSTRAINT FK_15D0E5A5C10A9183 FOREIGN KEY (elected_official_id) REFERENCES elected_officials (id)');
        $this->addSql('ALTER TABLE elected_officials_votes ADD CONSTRAINT FK_15D0E5A5C633199E FOREIGN KEY (legislation_id) REFERENCES legislations (id)');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE elected_officials_votes DROP FOREIGN KEY FK_15D0E5A5C633199E');
        $this->addSql('DROP TABLE legislations');
        $this->addSql('DROP TABLE elected_officials_votes');
    }
}
