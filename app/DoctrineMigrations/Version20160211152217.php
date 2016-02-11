<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160211152217 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE `keys` (id INT AUTO_INCREMENT NOT NULL, vote_id INT DEFAULT NULL, `key` VARCHAR(255) NOT NULL, created DATE NOT NULL, type VARCHAR(255) NOT NULL, INDEX IDX_B48E44EC72DCDAFC (vote_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('CREATE TABLE comments (id INT AUTO_INCREMENT NOT NULL, elected_id INT DEFAULT NULL, subject_id INT DEFAULT NULL, body LONGTEXT NOT NULL, created DATETIME NOT NULL, type VARCHAR(255) NOT NULL, INDEX IDX_5F9E962AA063E6C9 (elected_id), INDEX IDX_5F9E962A23EDC87 (subject_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('ALTER TABLE `keys` ADD CONSTRAINT FK_B48E44EC72DCDAFC FOREIGN KEY (vote_id) REFERENCES elected_officials_votes (id)');
        $this->addSql('ALTER TABLE comments ADD CONSTRAINT FK_5F9E962AA063E6C9 FOREIGN KEY (elected_id) REFERENCES elected_officials (id)');
        $this->addSql('ALTER TABLE comments ADD CONSTRAINT FK_5F9E962A23EDC87 FOREIGN KEY (subject_id) REFERENCES elected_officials_votes (id)');
        $this->addSql('ALTER TABLE environments CHANGE bottom_text bottom_text LONGTEXT NOT NULL, CHANGE show_bottom_text show_bottom_text TINYINT(1) DEFAULT NULL');
        $this->addSql('ALTER TABLE elected_officials_votes ADD comments_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE elected_officials_votes ADD CONSTRAINT FK_15D0E5A563379586 FOREIGN KEY (comments_id) REFERENCES comments (id)');
        $this->addSql('CREATE INDEX IDX_15D0E5A563379586 ON elected_officials_votes (comments_id)');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE elected_officials_votes DROP FOREIGN KEY FK_15D0E5A563379586');
        $this->addSql('DROP TABLE `keys`');
        $this->addSql('DROP TABLE comments');
        $this->addSql('DROP INDEX IDX_15D0E5A563379586 ON elected_officials_votes');
        $this->addSql('ALTER TABLE elected_officials_votes DROP comments_id');
        $this->addSql('ALTER TABLE environments CHANGE bottom_text bottom_text LONGTEXT DEFAULT NULL, CHANGE show_bottom_text show_bottom_text TINYINT(1) NOT NULL');
    }
}
