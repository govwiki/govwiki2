<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160629144049 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE groups ADD parent_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE groups ADD CONSTRAINT FK_F06D3970727ACA70 FOREIGN KEY (parent_id) REFERENCES groups (id)');
        $this->addSql('CREATE INDEX IDX_F06D3970727ACA70 ON groups (parent_id)');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE groups DROP FOREIGN KEY FK_F06D3970727ACA70');
        $this->addSql('DROP INDEX IDX_F06D3970727ACA70 ON groups');
        $this->addSql('ALTER TABLE groups DROP parent_id');
    }
}
