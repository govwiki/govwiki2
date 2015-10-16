<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20151015203433 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE create_requests (id INT AUTO_INCREMENT NOT NULL, user_id INT DEFAULT NULL, entity_name VARCHAR(255) NOT NULL, fields LONGTEXT NOT NULL COMMENT \'(DC2Type:array)\', comment LONGTEXT DEFAULT NULL, status VARCHAR(255) NOT NULL, created DATETIME NOT NULL, INDEX IDX_E5C37B65A76ED395 (user_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('ALTER TABLE create_requests ADD CONSTRAINT FK_E5C37B65A76ED395 FOREIGN KEY (user_id) REFERENCES users (id)');
        $this->addSql('DROP TABLE publicpaysumm');
        $this->addSql('ALTER TABLE legislations CHANGE summary summary VARCHAR(255) DEFAULT NULL');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE publicpaysumm (Entity Name VARCHAR(100) DEFAULT NULL, Entity Type VARCHAR(17) DEFAULT NULL, Year SMALLINT DEFAULT NULL, TotalWages DOUBLE PRECISION DEFAULT NULL, TotalComp DOUBLE PRECISION DEFAULT NULL, NumberOfFTEmps INT DEFAULT NULL, MedianSalary_FT DOUBLE PRECISION DEFAULT NULL, MedianBenefits_FT DOUBLE PRECISION DEFAULT NULL, MedianTotComp_FT DOUBLE PRECISION DEFAULT NULL, MedianSalary_GeneralPublic DOUBLE PRECISION DEFAULT NULL, MedianBenefits_GeneralPublic DOUBLE PRECISION DEFAULT NULL, MedianTotComp_GeneralPublic DOUBLE PRECISION DEFAULT NULL, MedianTotComp_FT_to_GeneralPublic DOUBLE PRECISION DEFAULT NULL, MaxComp DOUBLE PRECISION DEFAULT NULL, MaxCompEmployee VARCHAR(100) DEFAULT NULL, MaxCompTitle VARCHAR(100) DEFAULT NULL, MaxPension DOUBLE PRECISION DEFAULT NULL, MaxPensionRetiree VARCHAR(100) DEFAULT NULL, MedianPension DOUBLE PRECISION DEFAULT NULL, slug VARCHAR(100) DEFAULT NULL, INDEX Entity (Entity Name)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('DROP TABLE create_requests');
        $this->addSql('ALTER TABLE legislations CHANGE summary summary VARCHAR(1500) DEFAULT NULL');
    }
}
