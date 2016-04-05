<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160404142529 extends AbstractMigration
{
    private $keys = [
        'general.en',
        'general.es',
        'general.findata.main.overview',
        'general.findata.main.surplussldeficit',
    ];

    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $es = array_combine($this->keys, [
            'Inglés',
            'Español',
            'Overview',
            'Superávit / Déficit',
        ]);
        $en = array_combine($this->keys, [
            'English',
            'Spanish',
            'Overview',
            'Surplus / (Deficit)'
        ]);

        $esLocale = "(
            SELECT id
            FROM locales
            WHERE
                short_name = 'es' AND
                type = 'global'
        )";
        $esSql = [];
        foreach ($es as $key => $translation) {
            $esSql[] = "({$esLocale}, '{$key}', 'messages', '{$translation}', NOW(), NOW(), 'textarea')";
        }
        $esSql = implode(',', $esSql);

        $enLocale = "(
            SELECT id
            FROM locales
            WHERE
                short_name = 'en' AND
                type = 'global'
        )";
        $enSql = [];
        foreach ($en as $key => $translation) {
            $enSql[] = "({$enLocale}, '{$key}', 'messages', '{$translation}', NOW(), NOW(), 'textarea')";
        }
        $enSql = implode(',', $enSql);

        $this->addSql("
            INSERT IGNORE translations
                (locale_id, trans_key, message_domain, translation, date_created, date_updated, trans_textarea_type)
            VALUES {$esSql}
        ");
        $this->addSql("
            INSERT IGNORE translations
                (locale_id, trans_key, message_domain, translation, date_created, date_updated, trans_textarea_type)
            VALUES {$enSql}
        ");
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $keys = array_map(
            function ($value) {
                return '\''. $value .'\'';
            },
            $this->keys
        );

        $keys = implode(',', $keys);
        $this->addSql("DELETE FROM translations WHERE trans_key IN ({$keys})");
    }
}
