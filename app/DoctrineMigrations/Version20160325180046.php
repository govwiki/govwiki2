<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160325180046 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $es = [
            'general.findata.main.tree_charts' => 'Gráfica en Bloque',
            'general.findata.main.compare' => 'Comparar',
            'findata.captions.urban_affairs' => 'Urbanismo',
            'findata.captions.urban_development' => 'Desarrollo urbano',
            'findata.captions.training_and_employment' => 'Adiestramiento y empleo',
        ];

        $en = [
            'findata.captions.urban_affairs' => 'Urban affairs',
            'findata.captions.urban_development' => 'Urban development',
            'findata.captions.training_and_employment' => 'Training and employment',
        ];

        $locales = [
            'en' => $en,
            'es' => $es,
        ];

        foreach ($locales as $shortName => $translations) {
            foreach ($translations as $transKey => $translation) {
                $this->addSql("
                INSERT IGNORE translations
                (locale_id, trans_key, message_domain, translation, date_created, date_updated, trans_textarea_type) VALUES
                (
                    (SELECT id
                        FROM locales
                        WHERE
                            short_name = '{$shortName}' AND
                            type = 'global'),
                    '{$transKey}',
                    'messages',
                    '{$translation}',
                    NOW(),
                    NOW(),
                    'textarea'
                )
            ");
            }
        }
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

    }
}
