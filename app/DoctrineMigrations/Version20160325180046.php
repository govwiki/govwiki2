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

        foreach ($es as $transKey => $translation) {
            $this->addSql("
                UPDATE translations
                SET
                    translation = '{$translation}'
                WHERE
                    trans_key = '{$transKey}' AND
                    locale_id = (
                        SELECT id
                        FROM locales
                        WHERE
                            short_name = 'es' AND
                            type = 'global'
                    )
            ");
        }

        foreach ($en as $transKey => $translation) {
            $this->addSql("
                UPDATE translations
                SET
                    translation = '{$translation}'
                WHERE
                    trans_key = '{$transKey}' AND
                    locale_id = (
                        SELECT id
                        FROM locales
                        WHERE
                            short_name = 'en' AND
                            type = 'global'
                    )
            ");
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
