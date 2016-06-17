<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160525230004 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE issues ADD creator_id INT DEFAULT NULL, ADD state VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE issues ADD CONSTRAINT FK_DA7D7F8361220EA6 FOREIGN KEY (creator_id) REFERENCES users (id)');
        $this->addSql('CREATE INDEX IDX_DA7D7F8361220EA6 ON issues (creator_id)');

        $this->addSql("
            UPDATE issues
            SET creator_id = (
                SELECT id
                FROM users
                WHERE username = 'freedemster'
            )
        ");
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE issues DROP FOREIGN KEY FK_DA7D7F8361220EA6');
        $this->addSql('DROP INDEX IDX_DA7D7F8361220EA6 ON issues');
        $this->addSql('ALTER TABLE issues DROP creator_id, DROP state');
    }
}
