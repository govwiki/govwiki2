<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * 20150828171729
 */
class Version20150828171729 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE findata DROP FOREIGN KEY FK_F0441D60D187AFE5');
        $this->addSql('DROP INDEX IDX_F0441D60D187AFE5 ON findata');
        $this->addSql('ALTER TABLE findata CHANGE governments_id government_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE findata ADD CONSTRAINT FK_F0441D60F55836AA FOREIGN KEY (government_id) REFERENCES governments (id)');
        $this->addSql('CREATE INDEX IDX_F0441D60F55836AA ON findata (government_id)');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE findata DROP FOREIGN KEY FK_F0441D60F55836AA');
        $this->addSql('DROP INDEX IDX_F0441D60F55836AA ON findata');
        $this->addSql('ALTER TABLE findata CHANGE government_id governments_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE findata ADD CONSTRAINT FK_F0441D60D187AFE5 FOREIGN KEY (governments_id) REFERENCES governments (id)');
        $this->addSql('CREATE INDEX IDX_F0441D60D187AFE5 ON findata (governments_id)');
    }
}
