<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160803183327 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');
        /*
           ' ': '_',
           '-': '_d_',
           '&': 'amp',
           ',': '_c_',
           '(': 'lb',
           ')': 'rb',
           '/': 'sl',
           '%': 'proc',
           "'": "_apos_"
        */
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
            CREATE PROCEDURE convertFinData(environmentId INT)
            BEGIN
                DECLARE localeId INT(11);

                SET @localeId = (
                    SELECT id
                    FROM locales
                    WHERE environment_id = environmentId
                );

                INSERT INTO translations
                    (locale_id, trans_key, message_domain, translation, date_created, date_updated, trans_textarea_type)
                SELECT
                    @localeId,
                    c.trans_key,
                    'messages',
                    c.translation,
                    NOW(),
                    NOW(),
                    'textarea'
                FROM (
                        SELECT
                            f.caption AS translation,
                            CONCAT('findata.captions.', slugify(f.caption)) AS trans_key
                        FROM findata f
                        JOIN governments g ON g.id = f.government_id
                        WHERE g.environment_id = environmentId
                        GROUP BY f.caption
                    ) c
                WHERE
                    c.trans_key NOT IN (
                        SELECT
                            trans_key
                        FROM
                            translations t
                        JOIN
                            locales l ON l.id = t.locale_id
                    );
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

        $this->addSql('DROP FUNCTION slugify');
        $this->addSql('DROP PROCEDURE convertFinData');
    }
}
