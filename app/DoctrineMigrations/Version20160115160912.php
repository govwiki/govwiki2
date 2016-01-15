<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160115160912 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        /*
         * Get environment slugged name.
         */
        $this->addSql("
            SET @name = (
                SELECT e.slug FROM formats f
                INNER JOIN environments e ON f.environment_id = e.id
                WHERE field = 'population'
            )
        ");

        /*
         * Get Overview + Elected Official tab id.
         */
        $this->addSql('SET @tab_id = NULL');
        $this->addSql("
            SET @sql = CONCAT('SELECT g.id INTO @tab_id FROM groups g
                INNER JOIN environments e ON g.environment_id = e.id
                WHERE e.slug = \"', @name ,'\" AND g.name like \"%Elected%\"
                LIMIT 1
            ')
        ");
        $this->addSql('PREPARE stmt1 FROM @sql');
        $this->addSql('EXECUTE stmt1');
        $this->addSql('DEALLOCATE PREPARE stmt1');

        /*
         * Add web page column name.
         */
        $this->addSql("
            SET @sql = CONCAT('ALTER TABLE ', @name ,'
                ADD web_site_address varchar(255) DEFAULT NULL
            ')
        ");
        $this->addSql('PREPARE stmt1 FROM @sql');
        $this->addSql('EXECUTE stmt1');
        $this->addSql('DEALLOCATE PREPARE stmt1');

        /*
         * Insert row in formats;
         */
        $this->addSql("
            INSERT INTO formats (`field`, show_in, data_or_formula, ranked, environment_id, tab_id, `type`, `name`) VALUES ('web_site_address', 'a:4:{i:0;s:4:\"City\";i:1;s:6:\"County\";i:2;s:15:\"School District\";i:3;s:16:\"Special District\";}', 'data', 0, (SELECT id FROM environments WHERE slug = @name LIMIT 1), @tab_id, 'string', 'Web Site Address')
        ");

        /*
         * Migrate data.
         */
        $this->addSql("
            SET @sql = CONCAT(
                'UPDATE ', @name ,' p INNER JOIN governments_old og ON p.government_id = og.id SET p.web_site_address = og.web_site'
            )
        ");

        $this->addSql('PREPARE stmt1 FROM @sql');
        $this->addSql('EXECUTE stmt1');
        $this->addSql('DEALLOCATE PREPARE stmt1');

        $this->addSql('ALTER TABLE governments DROP web_site');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE governments ADD web_site VARCHAR(255) DEFAULT NULL');
        $this->addSql('UPDATE governments ng INNER JOIN governments_old og ON og.id = ng.id SET ng.web_site = og.web_site');
    }
}
