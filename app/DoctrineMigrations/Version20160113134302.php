<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160113134302 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE groups ADD decoration VARCHAR(255) DEFAULT NULL');
        $this->addSql('
            UPDATE groups
            SET decoration = \'bold\'
            WHERE type = \'category\'
        ');

        /*
         * Restore formats.
         */
        $this->addSql('
            UPDATE formats
            SET type = \'string\'
            WHERE field in (
                \'name_of_highest_paid_employee\',
                \'title_of_highest_paid_employee\',
                \'former_emp_with_largest_pension\'
            )
        ');

        /*
         * Get environment slugged name.
         */
        $this->addSql("
            SET @name = (
                SELECT e.slug FROM formats f
                INNER JOIN environments e ON f.environment_id = e.id
                WHERE field = 'name_of_highest_paid_employee'
            )
        ");

        /*
         * Change columns type.
         */
        $this->addSql("
            SET @sql = CONCAT('ALTER TABLE ', @name ,'
                CHANGE name_of_highest_paid_employee name_of_highest_paid_employee VARCHAR(255),
                CHANGE title_of_highest_paid_employee title_of_highest_paid_employee VARCHAR(255),
                CHANGE former_emp_with_largest_pension former_emp_with_largest_pension VARCHAR(255)
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
                    p.name_of_highest_paid_employee = og.name_of_highest_paid_employee,
                    p.title_of_highest_paid_employee = og.title_of_highest_paid_employee,
                    p.former_emp_with_largest_pension = og.former_emp_with_largest_pension
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

        $this->addSql('ALTER TABLE groups DROP decoration');
    }
}
