<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * 20150826181936
 */
class Version20150826181936 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE elected_officials CHANGE full_name full_name VARCHAR(255) DEFAULT NULL, CHANGE display_order display_order INT DEFAULT NULL, CHANGE title title VARCHAR(255) DEFAULT NULL, CHANGE email_address email_address VARCHAR(255) DEFAULT NULL, CHANGE telephone_number telephone_number VARCHAR(255) DEFAULT NULL, CHANGE photo_url photo_url VARCHAR(255) DEFAULT NULL, CHANGE bio_url bio_url VARCHAR(255) DEFAULT NULL, CHANGE term_expires term_expires VARCHAR(255) DEFAULT NULL');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE elected_officials CHANGE full_name full_name VARCHAR(255) NOT NULL, CHANGE display_order display_order INT NOT NULL, CHANGE title title VARCHAR(255) NOT NULL, CHANGE email_address email_address VARCHAR(255) NOT NULL, CHANGE telephone_number telephone_number VARCHAR(255) NOT NULL, CHANGE photo_url photo_url VARCHAR(255) NOT NULL, CHANGE bio_url bio_url VARCHAR(255) NOT NULL, CHANGE term_expires term_expires VARCHAR(255) NOT NULL');
    }
}
