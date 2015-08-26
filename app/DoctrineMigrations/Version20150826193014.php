<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * 20150826193014
 */
class Version20150826193014 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE public_statements (id INT AUTO_INCREMENT NOT NULL, elected_official_id INT DEFAULT NULL, date DATE NOT NULL, summary VARCHAR(255) NOT NULL, url VARCHAR(255) NOT NULL, INDEX IDX_383A543EC10A9183 (elected_official_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('ALTER TABLE public_statements ADD CONSTRAINT FK_383A543EC10A9183 FOREIGN KEY (elected_official_id) REFERENCES elected_officials (id)');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('DROP TABLE public_statements');
    }
}
