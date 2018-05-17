<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20180522075808 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE files (id BIGINT AUTO_INCREMENT NOT NULL, parent_id BIGINT DEFAULT NULL, uploader_id INT DEFAULT NULL, name VARCHAR(255) NOT NULL, public_path VARCHAR(255) NOT NULL, slug VARCHAR(255) NOT NULL, file_size INT DEFAULT NULL, created_at DATETIME NOT NULL, hidden TINYINT(1) NOT NULL, type VARCHAR(255) NOT NULL, ext VARCHAR(255) DEFAULT NULL, INDEX IDX_6354059727ACA70 (parent_id), INDEX IDX_635405916678C77 (uploader_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('ALTER TABLE files ADD CONSTRAINT FK_6354059727ACA70 FOREIGN KEY (parent_id) REFERENCES files (id)');
        $this->addSql('ALTER TABLE files ADD CONSTRAINT FK_635405916678C77 FOREIGN KEY (uploader_id) REFERENCES users (id)');
        $this->addSql('ALTER TABLE environments ADD can_sign_up TINYINT(1) NOT NULL, CHANGE show_government_comment show_government_comment TINYINT(1) NOT NULL');

        $this->addSql('UPDATE environments SET can_sign_up = true');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE files DROP FOREIGN KEY FK_6354059727ACA70');
        $this->addSql('DROP TABLE files');
        $this->addSql('ALTER TABLE environments DROP can_sign_up, CHANGE show_government_comment show_government_comment TINYINT(1) DEFAULT \'0\' NOT NULL');
    }
}
