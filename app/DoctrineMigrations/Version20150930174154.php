<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * 20150930174154
 */
class Version20150930174154 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE endorsements CHANGE name_of_endorser name_of_endorser VARCHAR(255) DEFAULT NULL, CHANGE endorser_type endorser_type VARCHAR(255) DEFAULT NULL, CHANGE election_year election_year INT DEFAULT NULL');
        $this->addSql('ALTER TABLE public_statements CHANGE date date DATE DEFAULT NULL, CHANGE summary summary VARCHAR(255) DEFAULT NULL, CHANGE url url VARCHAR(255) DEFAULT NULL');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE endorsements CHANGE name_of_endorser name_of_endorser VARCHAR(255) NOT NULL, CHANGE endorser_type endorser_type VARCHAR(255) NOT NULL, CHANGE election_year election_year INT NOT NULL');
        $this->addSql('ALTER TABLE public_statements CHANGE date date DATE NOT NULL, CHANGE summary summary VARCHAR(255) NOT NULL, CHANGE url url VARCHAR(255) NOT NULL');
    }
}
