<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160511154953 extends AbstractMigration
{
    private $key = 'mobile.search.help_text';

    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $locales = $this->connection->fetchAll("
            SELECT id
            FROM locales
            WHERE
                short_name = 'en' AND
                type <> 'global'
        ");
        $locales = array_map(
            function (array $row) {
                return $row['id'];
            },
            $locales
        );

        $part = [];
        foreach ($locales as $locale) {
            $part[] = "({$locale}, '{$this->key}', 'messages', \"Type city or official's name to get statistics or use map below\", NOW(), NOW(), 'textarea')";
        }
        $part = implode(',', $part);

        $this->addSql("
            INSERT IGNORE translations
            (locale_id, trans_key, message_domain, translation, date_created, date_updated, trans_textarea_type)
            VALUES {$part}
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
            WHERE trans_key = '{$this->key}'
        ");
    }
}
