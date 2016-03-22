<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160321143414 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $translationKeys = [
            'general.findata.main.pie',
            'general.findata.main.tree_charts',
            'general.findata.main.compare',
            'general.findata.main.step_1',
            'general.findata.main.step_2',
            'general.findata.main.step_3',
            'general.findata.main.government_name',
            'general.findata.main.to',
            'general.findata.main.by',
            'general.findata.main.category',
            'general.findata.main.caption',
            'general.findata.main.graph_placeholder',
            'general.findata.main.total_revenue',
            'general.findata.main.total_expenditure',
            'general.findata.main.overview',
            'general.findata.main.revenues',
            'general.findata.main.expenditures',
            'general.findata.main.general_fund',
            'general.findata.main.other_fund',
            'general.findata.main.total_fund',
        ];

        $en = [
            'Pie',
            'Tree Charts',
            'Compare',
            'Step 1',
            'Step 2',
            'Step 3',
            'Government Name',
            'To',
            'By',
            'Category',
            'Caption',
            'To see graph, please fill out the form',
            'Total Revenues',
            'Total Expenditures',
            'Overview',
            'Revenues',
            'Expenditures',
            'General Fund',
            'Other Funds',
            'Total Gov. Funds',
        ];

        $es = [
            'Gráfica circular (“pie”)',
            '“Tree Charts”',
            'Compare',
            'Paso 1',
            'Paso 2',
            'Paso 3',
            'Nombre del municipio',
            'Con',
            'Por',
            'Categoría',
            'Subtítulo',
            'Para ver la gráfica, favor llenar el formulario',
            'Total ingresos',
            'Total gastos',
            'Overview',
            'Ingresos',
            'Gastos',
            'Fondo General',
            'Otros fondos',
            'Total fondos gubernamentales',
        ];

        $locales = [];
        $locales['en'] = array_combine($translationKeys, $en);
        $locales['es'] = array_combine($translationKeys, $es);

        foreach ($locales as $shortName => $locale) {
            $sqlParts = [];
            foreach ($locale as $key => $translation) {
                $localeIdSql = "
                    SELECT id
                    FROM locales
                    WHERE
                        short_name = '{$shortName}' AND
                        type = 'global'
                    LIMIT 1
                ";

                $sqlParts[] = "(({$localeIdSql}), '${key}', 'messages', '{$translation}', NOW(), NOW(), 'textarea')";
            }

            $sqlParts = implode(',', $sqlParts);
            $this->addSql("
                INSERT INTO translations
                (locale_id, trans_key, message_domain, translation, date_created, date_updated, trans_textarea_type)
                VALUES
                {$sqlParts}
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

        $this->addSql("
            DELETE FROM translations
            WHERE trans_key LIKE 'general.findata.main.%'
        ");
    }
}
