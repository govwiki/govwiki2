<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * 20150826163044
 */
class Version20150826163044 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE elected_officials (id INT AUTO_INCREMENT NOT NULL, government_id INT DEFAULT NULL, full_name VARCHAR(255) NOT NULL, display_order INT NOT NULL, title VARCHAR(255) NOT NULL, email_address VARCHAR(255) NOT NULL, telephone_number VARCHAR(255) NOT NULL, photo_url VARCHAR(255) NOT NULL, bio_url VARCHAR(255) NOT NULL, term_expires VARCHAR(255) NOT NULL, INDEX IDX_B042A0B5F55836AA (government_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('ALTER TABLE elected_officials ADD CONSTRAINT FK_B042A0B5F55836AA FOREIGN KEY (government_id) REFERENCES governments (id)');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('DROP TABLE elected_officials');
    }
}
