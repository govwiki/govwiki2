<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Class Version20160315170912
 * @package Application\Migrations
 */
class Version20160315170912 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        $this->addSql('ALTER TABLE users ADD phone VARCHAR(255) DEFAULT NULL, ADD phone_confirmed TINYINT(1) NOT NULL, ADD phone_confirmed_key VARCHAR(255) DEFAULT NULL');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        $this->addSql('ALTER TABLE users DROP phone, DROP phone_confirmed, DROP phone_confirmed_key');
    }
}
