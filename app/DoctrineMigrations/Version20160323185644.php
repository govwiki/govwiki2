<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160323185644 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $formatsWithHelpText = $this->connection->fetchAll("
            SELECT help_text, field, environment_id
            FROM formats
            WHERE
                help_text IS NOT NULL AND
                help_text <> ''
        ");

        $sqlParts = [];
        foreach ($formatsWithHelpText as $format) {
            $transKey = "format.{$format['field']}.help_text";
            $translation = $format['help_text'];
            $locale = "(
                SELECT id
                FROM locales
                WHERE environment_id = {$format['environment_id']}
            )";

            $sqlParts[] = "({$locale}, '{$transKey}', 'messages', '{$translation}', NOW(), NOW(), 'textarea')";
        }

        $sqlParts = implode(',', $sqlParts);
        $this->addSql("
            INSERT INTO translations
            (locale_id, trans_key, message_domain, translation, date_created, date_updated, trans_textarea_type)
            VALUES
            {$sqlParts}
        ");

        // Fix puerto rico localizations and help text for es locale.
        $captions = [
            'format.net_change_in_fund_balance_total_revenue_gf' => 'Cambio neto en el Balance de Fondos / Ingresos del Fondo General',
            'format.end_of_year_fund_balance_gf_total_expenditures_gf' => 'Balance de Fondos (final del año) / Gastos del Fondo General',
            'format.current_assets_per_capita' => 'Activos corrientes / Población',
            'format.current_assets_current_liabilities' => 'Activos corrientes / Deudas corrientes',
            'format.balance_long_term_debt_per_capita' => 'Deudas a largo plazo / Población',
            'format.debt_service_expenditures_annual_income' => 'Servicio a la deuda / Ingresos generales anuales',
            'format.excess_deficiency_general_fund_revenues' => 'Exceso o deficiencia de ingresos / Gastos recurrentes',
            'format.change_in_net_assets_revenues_general_fund' => 'Cambio en activos netos/ Ingresos generales anuales',
            'format.fund_balance_all_funds_per_capita' => 'Total del Balance de Fondos / Población',
            'format.fund_balance_all_funds_long_term_liabilities' => 'Total del Balance de Fondos / Deuda a largo plazo',
            'format.intergovermental_funds_gf_revenues_gf' => 'Ingresos intergubernamentales estatales / Ingresos generales anuales',
            'format.total_unrestricted_net_position_total_assets' => 'Posición neta no restringida / Total de activos',
        ];

        $helpTexts = [
            'format.net_change_in_fund_balance_total_revenue_gf.help_text' => 'Examina el cambio neto en el Balance de Fondos (Fund Balance) del Fondo General durante el año',
            'format.end_of_year_fund_balance_gf_total_expenditures_gf.help_text' => 'Examina el tamaño del Balance de Fondos (Fund Balance) del Fondo General relativo a los gastos anuales del fondo general',
            'format.current_assets_per_capita.help_text' => 'Examina los activos del municipio (excepto capital) relativo a la población',
            'format.current_assets_current_liabilities.help_text' => 'Examina los activos del municipio (excepto capitales) relativo a los pasivos corrientes',
            'format.balance_long_term_debt_per_capita.help_text' => 'Examina la deuda a largo plazo por la población del municipio',
            'format.debt_service_expenditures_annual_income.help_text' => 'Examina el servicio de la deuda relativo a los ingresos anuales generales',
            'format.excess_deficiency_general_fund_revenues.help_text' => 'Examina el exceso/deficiencia (operacional) del Fondo General, sin tomar en consideración préstamos u otras transferencias',
            'format.change_in_net_assets_revenues_general_fund.help_text' => 'Examina el cambio en activos netos durante el año relativo a los ingresos anuales',
            'format.fund_balance_all_funds_per_capita.help_text' => 'Examina el Balance de Fondos (de todos los Fondos) por población',
            'format.fund_balance_all_funds_long_term_liabilities.help_text' => 'Examina el Balance de Fondos relativo a la deuda a largo plazo',
            'format.intergovermental_funds_gf_revenues_gf.help_text' => 'Examina los ingresos anuales provenientes del estado relativo a los ingreso anuales del municipio',
            'format.total_unrestricted_net_position_total_assets.help_text' => 'Examina el balance neto de los activos no restringidos',

        ];

        $esLocale = (int) $this->connection->fetchColumn("
            SELECT id
            FROM locales
            WHERE
                type = 'environment' AND
                short_name = 'es'
        ");

        // Captions.
        foreach ($captions as $key => $translation) {
            $this->addSql('
                UPDATE translations
                SET translation = :translation
                WHERE
                    trans_key = :key AND
                    locale_id = :locale
            ', [
                'translation' => $translation,
                'key' => $key,
                'locale' => $esLocale,
            ]);
        }

        // Help texts.
        $sqlParts = [];
        foreach ($helpTexts as $key => $translation) {
            $sqlParts[] = "({$esLocale}, '{$key}', 'messages', '{$translation}', NOW(), NOW(), 'textarea')";
        }

        $sqlParts = implode(',', $sqlParts);
        $this->addSql("
            INSERT INTO translations
            (locale_id, trans_key, message_domain, translation, date_created, date_updated, trans_textarea_type)
            VALUES
            {$sqlParts}
        ");
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
