<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160923111451 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE monetizations (id INT AUTO_INCREMENT NOT NULL, environment_id INT DEFAULT NULL, type VARCHAR(255) NOT NULL, enable TINYINT(1) NOT NULL, code LONGTEXT NOT NULL, position VARCHAR(255) NOT NULL, INDEX IDX_FBDF1336903E3A94 (environment_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('ALTER TABLE monetizations ADD CONSTRAINT FK_FBDF1336903E3A94 FOREIGN KEY (environment_id) REFERENCES environments (id)');

        // Move advertising into new entity.
        $this->addSql("
            INSERT INTO monetizations (environment_id, type, enable, code, position)
            SELECT
                environment_id,
                'advertising',
                adverting_enable,
                adverting_code,
                'top'
            FROM advertising
        ");

        $this->addSql('DROP TABLE advertising');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');
        $this->addSql('CREATE TABLE advertising (id INT AUTO_INCREMENT NOT NULL, environment_id INT DEFAULT NULL, adverting_type VARCHAR(255) NOT NULL, adverting_enable TINYINT(1) NOT NULL, adverting_code LONGTEXT NOT NULL, INDEX IDX_50219E78903E3A94 (environment_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('ALTER TABLE advertising ADD CONSTRAINT FK_50219E78903E3A94 FOREIGN KEY (environment_id) REFERENCES environments (id)');

        // Move advertising into previous entity.
        $this->addSql("
            INSERT INTO advertising
                (environment_id, adverting_type, adverting_enable, adverting_code)
            SELECT
                environment_id,
                'google_adsense',
                enable,
                code
            FROM monetizations
            WHERE type = 'advertising'
        ");

        $this->addSql('DROP TABLE monetizations');
    }
}
