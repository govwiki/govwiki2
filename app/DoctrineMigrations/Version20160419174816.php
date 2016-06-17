<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160419174816 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE `maps` ADD coloring_conditions LONGTEXT NOT NULL COMMENT \'(DC2Type:ColoringConditions)\'');

        $this->addSql('
            UPDATE `maps`
            SET coloring_conditions = colorized_county_conditions
        ');

        $this->addSql('ALTER TABLE `maps` DROP colorized_county_conditions');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE `maps` ADD colorized_county_conditions LONGTEXT NOT NULL');

        $this->addSql('
            UPDATE `maps`
            SET colorized_county_conditions = coloring_conditions
        ');

        $this->addSql('ALTER TABLE `maps` DROP coloring_conditions');
    }
}
