<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160425124502 extends AbstractMigration
{

    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE groups ADD tab_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE groups ADD CONSTRAINT FK_F06D39708D0C9323 FOREIGN KEY (tab_id) REFERENCES groups (id)');
        $this->addSql('CREATE INDEX IDX_F06D39708D0C9323 ON groups (tab_id)');

        // Move exists categories to new.
        $this->addSql("
            UPDATE `groups` g
            SET
                g.tab_id = (
                    SELECT f.tab_id
                    FROM `formats` f
                    WHERE f.category_id = g.id
                    GROUP BY tab_id
                    LIMIT 1
                )
            WHERE
                g.type = 'category' AND
                g.tab_id IS NULL
        ");

        // Create main categories for all tab.
        $this->addSql("
            INSERT INTO `groups`
            (
                tab_id,
                environment_id,
                name,
                order_number,
                type,
                decoration
            )
            SELECT
                id,
                environment_id,
                'Main',
                99,
                'category',
                'bold'
            FROM `groups`
            WHERE type = 'tab'
        ");

        // Move formats to new main categories.
        $this->addSql("
            UPDATE `formats` f
            SET f.category_id = (
                SELECT g.id
                FROM groups g
                WHERE
                    g.tab_id = f.tab_id AND
                    name = 'Main'
            )
            WHERE
                f.tab_id IS NOT NULL AND
                f.category_id IS NULL
        ");

        $this->addSql("
            UPDATE `governments` SET
                  state = 'PR'
                , type = ''
            WHERE
                environment_id = (
                    SELECT id
                    FROM `environments`
                    WHERE slug = 'puerto_rico'
                ) AND
                state IS NULL AND
                type IS NULL
        ");

        $this->addSql('ALTER TABLE formats DROP FOREIGN KEY FK_DBCBA3C8D0C9323');
        $this->addSql('DROP INDEX IDX_DBCBA3C8D0C9323 ON formats');
        $this->addSql('ALTER TABLE formats DROP tab_id');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        // Remove all main category.
        $this->addSql("
            UPDATE `formats` f
            SET f.category_id = NULL
            WHERE f.category_id IN (
                SELECT g.id
                FROM groups g
                WHERE
                    g.id = f.category_id AND
                    name = 'Main'
            )
        ");
        $this->addSql("DELETE FROM `groups` WHERE name = 'Main'");

        $this->addSql('ALTER TABLE `groups` DROP FOREIGN KEY FK_F06D39708D0C9323');
        $this->addSql('DROP INDEX IDX_F06D39708D0C9323 ON groups');
        $this->addSql('ALTER TABLE groups DROP tab_id');
    }
}
