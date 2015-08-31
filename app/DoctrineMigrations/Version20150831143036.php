<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * 20150831143036
 */
class Version20150831143036 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE open_enrollment_schools (id INT AUTO_INCREMENT NOT NULL, state_id VARCHAR(255) DEFAULT NULL, county VARCHAR(255) DEFAULT NULL, district_name VARCHAR(255) DEFAULT NULL, list_of_schools VARCHAR(255) DEFAULT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('CREATE TABLE trigger_schools (id INT AUTO_INCREMENT NOT NULL, state_id VARCHAR(255) DEFAULT NULL, trigger_schools VARCHAR(255) DEFAULT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('DROP TABLE open_enrollment_schools');
        $this->addSql('DROP TABLE trigger_schools');
    }
}
