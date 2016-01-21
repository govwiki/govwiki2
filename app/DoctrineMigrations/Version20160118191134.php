<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160118191134 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE elected_officials ADD elected_official_comments LONGTEXT DEFAULT NULL');
        $this->addSql('ALTER TABLE elected_officials ADD linked_user_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE elected_officials ADD CONSTRAINT FK_B042A0B5CC26EB02 FOREIGN KEY (linked_user_id) REFERENCES users (id)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_B042A0B5CC26EB02 ON elected_officials (linked_user_id)');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE elected_officials DROP elected_official_comments');
        $this->addSql('ALTER TABLE elected_officials DROP FOREIGN KEY FK_B042A0B5CC26EB02');
        $this->addSql('DROP INDEX UNIQ_B042A0B5CC26EB02 ON elected_officials');
        $this->addSql('ALTER TABLE elected_officials DROP linked_user_id');
    }
}
