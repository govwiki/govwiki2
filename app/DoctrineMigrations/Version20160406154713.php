<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160406154713 extends AbstractMigration
{
    private static $keys = [
        'form.username',
        'form.email',
        'form.phone',
        'form.phone.placeholder',
        'form.password',
        'form.password_confirmation',
        'form.subscribe_to',
        'registration.submit',
        'registration.title',
        'form.subscribe_to.help',
    ];

    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $en = [
            'Username',
            'Email',
            'Phone',
            'optional, example: 4158675309',
            'Password',
            'Repeat password',
            'Subscribe to',
            'Register',
            'Register',
            'Please register in order to receive or send us information about your Municipality.',
        ];
        $es = [
            'Nombre de usuario',
            'Email',
            'Teléfono',
            'opcional, ejemplo: 7875551212',
            'Contraseña',
            'Repita la contraseña',
            'Suscríbase a',
            'Registro de usuario',
            'Registro',
            'Favor registrarse si desea recibir o enviarnos información sobre su Municipio.',
        ];

        $en = array_combine(self::$keys, $en);
        $es = array_combine(self::$keys, $es);

        $esLocale = "(
            SELECT id
            FROM locales
            WHERE
                short_name = 'es' AND
                type = 'global'
        )";

        $enLocale = "(
            SELECT id
            FROM locales
            WHERE
                short_name = 'en' AND
                type = 'global'
        )";

        $esSql = [];
        foreach ($es as $key => $translation) {
            $esSql[] = "({$esLocale}, '{$key}', 'messages', '{$translation}', NOW(), NOW(), 'textarea')";
        }
        $esSql = implode(',', $esSql);

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
            self::$keys
        );

        $keys = implode(',', $keys);
        $this->addSql("DELETE FROM translations WHERE trans_key IN ({$keys})");
    }
}
