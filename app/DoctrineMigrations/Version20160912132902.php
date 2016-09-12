<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160912132902 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('DROP FUNCTION IF EXISTS slugify');
        $this->addSql('DROP TRIGGER IF EXISTS add_translation_for_findata');
        $this->addSql("
        CREATE FUNCTION slugify(str CHAR(255))
            RETURNS CHAR(255)
            DETERMINISTIC
            LANGUAGE SQL
            RETURN LOWER(
                REPLACE(
                    REPLACE(
                        REPLACE(
                            REPLACE(
                                REPLACE(
                                    REPLACE(
                                        REPLACE(
                                            REPLACE(
                                                REPLACE(
                                                    TRIM(str),
                                                    ' ',
                                                    '_'
                                                ),
                                                '-',
                                                '_d_'
                                            ),
                                            '&',
                                            'amp'
                                        ),
                                        ',',
                                        '_c_'
                                    ),
                                    '(',
                                    'lb'
                                ),
                                ')',
                                'rb'
                            ),
                            '/',
                            'sl'
                        ),
                        '%',
                        'proc'
                    ),
                    \"'\",
                    '_apos_'
                )
            )
        ");
        $this->addSql("
            CREATE TRIGGER add_translation_for_findata AFTER INSERT ON findata
            FOR EACH ROW
            BEGIN
                INSERT INTO translations
                    (locale_id, trans_key, message_domain, translation, date_created, date_updated, trans_textarea_type)
                SELECT
                    locale.id,
                    CONCAT('findata.captions.', slugify(new.caption)) AS trans_key,
                    'messages',
                    new.caption,
                    NOW(),
                    NOW(),
                    'textarea'
                FROM locales locale
                JOIN governments government ON new.government_id = government.id
                WHERE locale.environment_id = government.environment_id;
            END;
        ");
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('DROP TRIGGER add_translation_for_findata');
    }
}
