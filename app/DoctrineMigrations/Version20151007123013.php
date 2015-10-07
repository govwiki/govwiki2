<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * 20151007123013
 */
class Version20151007123013 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE edit_requests (id INT AUTO_INCREMENT NOT NULL, user_id INT DEFAULT NULL, entity_name VARCHAR(255) NOT NULL, entity_id INT NOT NULL, changes LONGTEXT NOT NULL COMMENT \'(DC2Type:array)\', comment LONGTEXT DEFAULT NULL, INDEX IDX_508B7278A76ED395 (user_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('ALTER TABLE edit_requests ADD CONSTRAINT FK_508B7278A76ED395 FOREIGN KEY (user_id) REFERENCES users (id)');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('DROP TABLE edit_requests');
    }
}
