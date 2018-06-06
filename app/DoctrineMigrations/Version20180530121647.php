<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20180530121647 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE files ADD environment_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE files ADD CONSTRAINT FK_6354059903E3A94 FOREIGN KEY (environment_id) REFERENCES environments (id)');
        $this->addSql('CREATE INDEX IDX_6354059903E3A94 ON files (environment_id)');
        $this->addSql('ALTER TABLE environments ADD library_credentials LONGTEXT DEFAULT NULL COMMENT \'(DC2Type:object)\'');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE files DROP FOREIGN KEY FK_6354059903E3A94');
        $this->addSql('DROP INDEX IDX_6354059903E3A94 ON files');
        $this->addSql('ALTER TABLE files DROP environment_id');
        $this->addSql('ALTER TABLE environments DROP library_credentials');
    }
}
