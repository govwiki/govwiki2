<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160204123935 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE governments DROP annual_salary_mayor, DROP years_mayor_in_office, CHANGE mayor_name secondary_logo_path VARCHAR(255) DEFAULT NULL');
        $this->addSql('UPDATE governments SET secondary_logo_path = secondary_logo_url');
        $this->addSql('UPDATE governments SET secondary_logo_url = NULL');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('UPDATE governments SET secondary_logo_url = secondary_logo_path');
        $this->addSql('UPDATE governments SET secondary_logo_path = NULL');
        $this->addSql('ALTER TABLE governments ADD annual_salary_mayor DOUBLE PRECISION DEFAULT NULL, ADD years_mayor_in_office INT DEFAULT NULL, CHANGE secondary_logo_path mayor_name VARCHAR(255) DEFAULT NULL');
    }
}
