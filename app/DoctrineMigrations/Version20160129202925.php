<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160129202925 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE environments ADD title VARCHAR(255) NOT NULL');
        $this->addSql('ALTER TABLE governments DROP rand, DROP inc_id');
        $this->addSql('ALTER TABLE maps CHANGE colorized_county_conditions colorized_county_conditions LONGTEXT NOT NULL COMMENT \'(DC2Type:ColorizedCountyConditions)\'');

        $this->addSql('
            UPDATE environments
            SET title =\'CPC Civic Profiles\'
            WHERE slug = \'california\'
        ');

        $this->addSql('
            UPDATE environments
            SET title = \'CIPP Municipio Rankings\'
            WHERE slug = \'puerto_rico\'
        ');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE environments DROP title');
        $this->addSql('ALTER TABLE governments ADD rand DOUBLE PRECISION DEFAULT NULL, ADD inc_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE maps CHANGE colorized_county_conditions colorized_county_conditions LONGTEXT NOT NULL');
    }
}
