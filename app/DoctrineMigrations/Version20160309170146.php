<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Class Version20160309170146
 * @package Application\Migrations
 */
class Version20160309170146 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        $this->addSql('ALTER TABLE environments ADD admin_email VARCHAR(255) NOT NULL');
        $this->addSql('UPDATE environments SET admin_email="contact@calpolicycenter.org";');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        $this->addSql('ALTER TABLE environments DROP admin_email');
    }
}
