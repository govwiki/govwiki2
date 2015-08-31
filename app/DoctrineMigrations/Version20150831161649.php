<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * 20150831161649
 */
class Version20150831161649 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE legislations ADD government_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE legislations ADD CONSTRAINT FK_22118D43F55836AA FOREIGN KEY (government_id) REFERENCES governments (id)');
        $this->addSql('CREATE INDEX IDX_22118D43F55836AA ON legislations (government_id)');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE legislations DROP FOREIGN KEY FK_22118D43F55836AA');
        $this->addSql('DROP INDEX IDX_22118D43F55836AA ON legislations');
        $this->addSql('ALTER TABLE legislations DROP government_id');
    }
}
