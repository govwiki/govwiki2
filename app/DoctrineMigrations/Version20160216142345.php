<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160216142345 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        /*
         * Backup all old create requests data.
         */
        $this->addSql('CREATE TABLE create_requests_old SELECT * FROM create_requests');

        $this->addSql('ALTER TABLE create_requests_old ADD CONSTRAINT FK_16DDDFE5A76ED395 FOREIGN KEY (user_id) REFERENCES users (id)');
        $this->addSql('ALTER TABLE create_requests_old ADD CONSTRAINT FK_16DDDFE5903E3A94 FOREIGN KEY (environment_id) REFERENCES environments (id)');

        $this->addSql('ALTER TABLE legislations ADD request_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE legislations ADD CONSTRAINT FK_22118D43427EB8A5 FOREIGN KEY (request_id) REFERENCES create_requests (id)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_22118D43427EB8A5 ON legislations (request_id)');
        $this->addSql('ALTER TABLE public_statements ADD request_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE public_statements ADD CONSTRAINT FK_383A543E427EB8A5 FOREIGN KEY (request_id) REFERENCES create_requests (id)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_383A543E427EB8A5 ON public_statements (request_id)');
        $this->addSql('ALTER TABLE environments CHANGE bottom_text bottom_text LONGTEXT NOT NULL, CHANGE show_bottom_text show_bottom_text TINYINT(1) DEFAULT NULL');
        $this->addSql('ALTER TABLE elected_officials_votes DROP FOREIGN KEY FK_15D0E5A563379586');
        $this->addSql('DROP INDEX IDX_15D0E5A563379586 ON elected_officials_votes');
        $this->addSql('ALTER TABLE elected_officials_votes DROP comments_id');

        $this->addSql('ALTER TABLE contributions ADD request_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE contributions ADD CONSTRAINT FK_76391EFE427EB8A5 FOREIGN KEY (request_id) REFERENCES create_requests (id)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_76391EFE427EB8A5 ON contributions (request_id)');
        $this->addSql('ALTER TABLE endorsements ADD request_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE endorsements ADD CONSTRAINT FK_54D08617427EB8A5 FOREIGN KEY (request_id) REFERENCES create_requests (id)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_54D08617427EB8A5 ON endorsements (request_id)');
        $this->addSql('ALTER TABLE create_requests DROP FOREIGN KEY FK_E5C37B65A76ED395');
        $this->addSql('DROP INDEX IDX_E5C37B65A76ED395 ON create_requests');
        $this->addSql('ALTER TABLE create_requests ADD subject_id INT DEFAULT NULL, DROP fields, DROP comment, CHANGE user_id creator_id INT DEFAULT NULL, CHANGE created created_at DATETIME NOT NULL, CHANGE entity_name type VARCHAR(255) NOT NULL');
        $this->addSql('ALTER TABLE create_requests ADD CONSTRAINT FK_E5C37B6561220EA6 FOREIGN KEY (creator_id) REFERENCES users (id)');
        $this->addSql('CREATE INDEX IDX_E5C37B6561220EA6 ON create_requests (creator_id)');
        $this->addSql('CREATE INDEX IDX_E5C37B6523EDC87 ON create_requests (subject_id)');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE contributions DROP FOREIGN KEY FK_76391EFE427EB8A5');
        $this->addSql('DROP INDEX UNIQ_76391EFE427EB8A5 ON contributions');
        $this->addSql('ALTER TABLE contributions DROP request_id');
        $this->addSql('ALTER TABLE create_requests DROP FOREIGN KEY FK_E5C37B6561220EA6');
        $this->addSql('DROP INDEX IDX_E5C37B6561220EA6 ON create_requests');
        $this->addSql('DROP INDEX IDX_E5C37B6523EDC87 ON create_requests');
        $this->addSql('ALTER TABLE create_requests ADD user_id INT DEFAULT NULL, ADD fields LONGTEXT NOT NULL COMMENT \'(DC2Type:array)\', ADD comment LONGTEXT DEFAULT NULL, DROP creator_id, DROP subject_id, CHANGE type entity_name VARCHAR(255) NOT NULL, CHANGE created_at created DATETIME NOT NULL');
        $this->addSql('ALTER TABLE create_requests ADD CONSTRAINT FK_E5C37B65A76ED395 FOREIGN KEY (user_id) REFERENCES users (id)');
        $this->addSql('CREATE INDEX IDX_E5C37B65A76ED395 ON create_requests (user_id)');
        $this->addSql('ALTER TABLE elected_officials_votes ADD comments_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE elected_officials_votes ADD CONSTRAINT FK_15D0E5A563379586 FOREIGN KEY (comments_id) REFERENCES comments (id)');
        $this->addSql('CREATE INDEX IDX_15D0E5A563379586 ON elected_officials_votes (comments_id)');
        $this->addSql('ALTER TABLE endorsements DROP FOREIGN KEY FK_54D08617427EB8A5');
        $this->addSql('DROP INDEX UNIQ_54D08617427EB8A5 ON endorsements');
        $this->addSql('ALTER TABLE endorsements DROP request_id');
        $this->addSql('ALTER TABLE environments CHANGE bottom_text bottom_text LONGTEXT DEFAULT NULL, CHANGE show_bottom_text show_bottom_text TINYINT(1) NOT NULL');
        $this->addSql('ALTER TABLE legislations DROP FOREIGN KEY FK_22118D43427EB8A5');
        $this->addSql('DROP INDEX UNIQ_22118D43427EB8A5 ON legislations');
        $this->addSql('ALTER TABLE legislations DROP request_id');
        $this->addSql('ALTER TABLE public_statements DROP FOREIGN KEY FK_383A543E427EB8A5');
        $this->addSql('DROP INDEX UNIQ_383A543E427EB8A5 ON public_statements');
        $this->addSql('ALTER TABLE public_statements DROP request_id');
    }
}
