<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160318133137 extends AbstractMigration implements
    ContainerAwareInterface
{

    /**
     * @var ContainerInterface
     */
    private $container;

    /**
     * Sets the container.
     *
     * @param ContainerInterface|null $container A ContainerInterface instance
     *                                           or null
     */
    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    public function postUp(Schema $schema)
    {
        $con = $this->container->get('database_connection');

        /*
         * Add fin data translation.
         */

        // Get all global locale ids.
        $locales = $con->fetchAll("
            SELECT id
            FROM locales
            WHERE type = 'global'
        ");
        $locales = array_map(
            function (array $row) { return $row['id']; },
            $locales
        );

        $captions = $con->fetchAll('
            SELECT caption
            FROM findata
            GROUP BY caption
        ');
        $captions = array_map(
            function (array $row) { return $row['caption']; },
            $captions
        );

        // Prepare values section for insert statement.
        $sqlParts = [];
        $group = [];
        $maxGroupCount = 200 * count($locales);

        foreach ($captions as $value) {
            $key = strtr(strtolower($value), [
                ' ' => '_',
                '-' => '_d_',
                '&' => 'amp',
                ',' => '_c_',
                '(' => 'lb',
                ')' => 'rb',
                '/' => 'sl',
                '%' => 'proc',
                "'" => '_apos_',
            ]);

            // Add current translation to each global locale.
            foreach ($locales as $locale) {
                $group[] = "({$locale}, 'findata.captions.{$key}', 'messages', \"$value\", NOW(), NOW())";
            }

            if (count($group) >= $maxGroupCount) {
                $sqlParts[] = $group;
                $group = [];
            }
        }

        $this->write('Add translations for global locales');
        foreach ($sqlParts as $part) {
            $part = implode(',', $part);
            $con->exec("
                INSERT INTO translations
                (
                    locale_id, trans_key, message_domain, translation, date_created,
                    date_updated
                )
                VALUES
                {$part}
            ");
        }
    }


    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE locales ADD type VARCHAR(255) NOT NULL');

        $this->addSql("UPDATE locales SET type = 'environment'");

        // Duplicate unique locales as global locales.
        $this->addSql("
            INSERT INTO locales (short_name, type)
            SELECT x.short_name, 'global' AS type
            FROM (
                SELECT short_name
                FROM locales
                GROUP BY short_name
            ) x
        ");

        $this->addSql("
            DELETE FROM translations
            WHERE
                trans_key LIKE 'general.year_selector_label' AND
                locale_id IN (
                    SELECT id
                    FROM locales
                    WHERE type = 'environment'
                )
        ");

        // Add year translation to all global locales.
        $this->addSql("
            INSERT INTO translations
            (
                locale_id, trans_key, message_domain, translation, date_created,
                date_updated
            )
            SELECT
                l.id, 'general.year_selector_label', 'messages', 'Year', NOW(),
                NOW()
            FROM locales l
            WHERE type = 'global'
        ");
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql("
            DELETE FROM translations
            WHERE locale_id IN (SELECT id FROM locales WHERE type = 'global')
        ");
        $this->addSql("DELETE FROM locales WHERE type = 'global'");
        $this->addSql('ALTER TABLE locales DROP type');
    }
}
