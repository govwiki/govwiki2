<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160324123500 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $esLocale = (int) $this->connection->fetchColumn("
            SELECT id
            FROM locales
            WHERE
                type = 'environment' AND
                short_name = 'es'
        ");

        $map = [
            'format.current_assets' => 'Activos corrientes',
            'format.current_liabilities' => 'Deudas corrientes',
            'format.balance_long_term_debt' => 'Balance de la deuda a largo plazo',
            'format.total_assets' => 'Total activos',
            'format.total_net_position' => 'Posición neta total',
            'format.total_unrestricted_net_position' => 'Posición neta no restringida total',
            'format.general_revenues' => 'Ingresos generales anuales',
            'format.change_in_net_assets' => 'Cambio en activos netos',
            'format.general_fund_revenues' => 'Ingresos del Fondo General',
            'format.government_fund_expenditures' => 'Gastos del fondo gubernamental',
            'format.excess_deficiency_general_fund' => 'Exceso / Deficiencia del Fondo General',
            'format.net_change_in_fund_balance_gf' => 'Cambio neto en el balance de fondos (FG)',
            'format.end_of_year_fund_balance_gf' => 'Balance de Fondos a final del año (FG)',
            'format.debt_service_expenditures' => 'Gastos del servicio a la deuda',
            'format.intergovermental_funds_gf' => 'Fondos intergubernamentales (FG)',
            'format.fund_balance_all_funds' => 'Balance de fondos, todos los fondos',
        ];

        foreach ($map as $transKey => $translation) {
            $this->addSql("
                UPDATE translations
                SET
                    translation = '{$translation}'
                WHERE
                    trans_key = '{$transKey}' AND
                    locale_id = {$esLocale}
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
