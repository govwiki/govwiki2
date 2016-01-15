<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160115211859 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        /*
         * Restore formats.
         */
        $this->addSql('
            UPDATE formats
            SET type = \'string\'
            WHERE field in (
                \'parent_trigger_eligible_schools\',
                \'open_enrollment_schools\'
            )
        ');

        /*
         * Get environment slugged name.
         */
        $this->addSql("
            SET @name = (
                SELECT e.slug FROM formats f
                INNER JOIN environments e ON f.environment_id = e.id
                WHERE field = 'parent_trigger_eligible_schools'
            )
        ");

        /*
         * Change columns type.
         */
        $this->addSql("
            SET @sql = CONCAT('ALTER TABLE ', @name ,'
                CHANGE parent_trigger_eligible_schools parent_trigger_eligible_schools VARCHAR(255),
                CHANGE open_enrollment_schools open_enrollment_schools VARCHAR(255)
            ')
        ");
        $this->addSql('PREPARE stmt1 FROM @sql');
        $this->addSql('EXECUTE stmt1');
        $this->addSql('DEALLOCATE PREPARE stmt1');

        /*
         * Update values.
         */
        $this->addSql("
            SET @sql = CONCAT('
                UPDATE ', @name, ' p
                INNER JOIN governments ng ON p.government_id = ng.id
                INNER JOIN governments_old og ON ng.id = og.id
                SET
                    p.open_enrollment_schools = og.open_enrollment_schools,
                    p.parent_trigger_eligible_schools = og.parent_trigger_eligible_schools
            ')
        ");
        $this->addSql('PREPARE stmt1 FROM @sql');
        $this->addSql('EXECUTE stmt1');
        $this->addSql('DEALLOCATE PREPARE stmt1');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');
        // :-)
    }
}
