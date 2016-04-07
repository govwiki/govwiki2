<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Class Version20160316161000
 * @package Application\Migrations
 */
class Version20160316161000 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        $this->addSql('CREATE TABLE twilio_sms_messages (id INT AUTO_INCREMENT NOT NULL, from_number VARCHAR(255) NOT NULL, to_number VARCHAR(255) NOT NULL, message VARCHAR(255) NOT NULL, error VARCHAR(255) DEFAULT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        $this->addSql('DROP TABLE twilio_sms_messages');
    }
}
