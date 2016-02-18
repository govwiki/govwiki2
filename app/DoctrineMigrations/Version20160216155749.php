<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160216155749 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE legislations DROP FOREIGN KEY FK_22118D4361220EA6');
        $this->addSql('DROP INDEX IDX_22118D4361220EA6 ON legislations');
        $this->addSql('ALTER TABLE legislations DROP creator_id, DROP create_at, DROP state');
        $this->addSql('ALTER TABLE public_statements DROP FOREIGN KEY FK_383A543E61220EA6');
        $this->addSql('DROP INDEX IDX_383A543E61220EA6 ON public_statements');
        $this->addSql('ALTER TABLE public_statements DROP creator_id, DROP create_at, DROP state');
        $this->addSql('ALTER TABLE contributions DROP FOREIGN KEY FK_76391EFE61220EA6');
        $this->addSql('DROP INDEX IDX_76391EFE61220EA6 ON contributions');
        $this->addSql('ALTER TABLE contributions DROP creator_id, DROP create_at, DROP state');
        $this->addSql('ALTER TABLE endorsements DROP FOREIGN KEY FK_54D0861761220EA6');
        $this->addSql('DROP INDEX IDX_54D0861761220EA6 ON endorsements');
        $this->addSql('ALTER TABLE endorsements DROP creator_id, DROP create_at, DROP state');
        $this->addSql('DROP INDEX IDX_E5C37B6523EDC87 ON create_requests');
        $this->addSql('ALTER TABLE create_requests DROP subject_id');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE contributions ADD creator_id INT DEFAULT NULL, ADD create_at DATETIME NOT NULL, ADD state VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE contributions ADD CONSTRAINT FK_76391EFE61220EA6 FOREIGN KEY (creator_id) REFERENCES users (id)');
        $this->addSql('CREATE INDEX IDX_76391EFE61220EA6 ON contributions (creator_id)');
        $this->addSql('ALTER TABLE create_requests ADD subject_id INT DEFAULT NULL');
        $this->addSql('CREATE INDEX IDX_E5C37B6523EDC87 ON create_requests (subject_id)');
        $this->addSql('ALTER TABLE endorsements ADD creator_id INT DEFAULT NULL, ADD create_at DATETIME NOT NULL, ADD state VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE endorsements ADD CONSTRAINT FK_54D0861761220EA6 FOREIGN KEY (creator_id) REFERENCES users (id)');
        $this->addSql('CREATE INDEX IDX_54D0861761220EA6 ON endorsements (creator_id)');
        $this->addSql('ALTER TABLE legislations ADD creator_id INT DEFAULT NULL, ADD create_at DATETIME NOT NULL, ADD state VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE legislations ADD CONSTRAINT FK_22118D4361220EA6 FOREIGN KEY (creator_id) REFERENCES users (id)');
        $this->addSql('CREATE INDEX IDX_22118D4361220EA6 ON legislations (creator_id)');
        $this->addSql('ALTER TABLE public_statements ADD creator_id INT DEFAULT NULL, ADD create_at DATETIME NOT NULL, ADD state VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE public_statements ADD CONSTRAINT FK_383A543E61220EA6 FOREIGN KEY (creator_id) REFERENCES users (id)');
        $this->addSql('CREATE INDEX IDX_383A543E61220EA6 ON public_statements (creator_id)');
    }
}
