<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160617145746 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE elected_officials DROP FOREIGN KEY FK_B042A0B5D08F78D7');
        $this->addSql('DROP INDEX IDX_B042A0B5D08F78D7 ON elected_officials');
        $this->addSql('ALTER TABLE elected_officials DROP bio_editor_id, DROP new_bio');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE elected_officials ADD bio_editor_id INT DEFAULT NULL, ADD new_bio LONGTEXT NOT NULL');
        $this->addSql('ALTER TABLE elected_officials ADD CONSTRAINT FK_B042A0B5D08F78D7 FOREIGN KEY (bio_editor_id) REFERENCES users (id)');
        $this->addSql('CREATE INDEX IDX_B042A0B5D08F78D7 ON elected_officials (bio_editor_id)');
    }
}
