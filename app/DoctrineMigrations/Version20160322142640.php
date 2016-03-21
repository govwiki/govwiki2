<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160322142640 extends AbstractMigration
{
    private $map = [
        'Surplus / (Deficit)' => 'Superávit / Déficit ',
        'FUND BALANCES (DEFICIT) - ENDING' => 'Balance de Fondos (déficit)- final',
        'Federal Grants' => 'Subvenciones federales',
        'General Administration' => 'Administración general',
        'Public works' => 'Mejoras capitales',
        'Sales Taxes' => 'Impuestos sobre las ventas ',
        'Health, sanitation and welfare' => 'Salud, servicios sanitarios, y asistencia social',
        'Property Tax' => 'Impuestos sobre la propiedad',
        'Construction Excise Taxes' => 'Arbitrios de construcción',
        'Interest' => 'Intereses',
        'Culture, recreation and education' => 'Cultura, recreación y educación',
        'Principal' => 'Principal',
        'Patents' => 'Patentes',
        'Public safety' => 'Seguridad pública',
        'Interest Income' => 'Ingresos por intereses',
        'Other Revenue' => 'Otros ingresos',
        'Rental income' => 'Ingresos de alquiler',
        'Licenses and permits' => 'Licencias y permisos',
        'Total Revenues' => 'Total ingresos',
        'Total Expenditures' => 'Total gastos',
        'Total governmental Activities' => 'Total actividades gubernamentales',
        'General government' => 'Gobierno central',
        'Commonwealth Government' => 'Gobierno central',
        'Charges for sales and services' => 'Cargos por ventas y servicios',
        'Capital outlays' => 'Gastos de capital',
        'Sales and use taxes' => 'Impuestos sobre ventas y uso (IVU)',
        'Federal Government' => 'Gobierno federal',
        'Public Housing and welfare' => 'Vivienda pública y asistencia social',
        'Municipal license taxes' => 'Impuestos sobre licencias municipales',
        'Culture and recreation' => 'Recreación y cultura',
        'Education' => 'Educación',
        'BOND ISSUANCE COSTS' => 'Costos de emisión de bonos',
        'Intergovernmental' => 'Intergubernamental',
        'Volume of Business Taxes' => 'Impuestos a las empresas',
        'Human Services and Welfare' => 'Servicios humanos y asistencia social',
        'Public Instruction' => 'Instrucción pública',
        'Community development' => 'Desarrollo comunitario',
        'Landfill Post-Closure Care Costs' => 'Costos mantenimiento de vertederos clausurados',
        'Urban development' => 'Desarrollo urbano',
        'Mayor and municipal legislature' => 'Alcalde y legislatura municipal',
        'Family and social development' => 'Desarrollo social y de la familia',
        'Municipal taxes' => 'Impuestos municipales',
        'Economic Development' => 'Desarrollo económico',
        'Intergovernmental, grants and contributions' => 'Intergubernamental, subvenciones y donativos',
        'Total tax revenues' => 'Total ingresos tributarios',
        'Community and economic development' => 'Desarrollo comunitario y económico',
        'Solid waste disposal' => 'Manejo de desperdicios sólidos',
        'Reimbursement to Grantor Agency' => 'Reembolsos a agencias otorgantes ',
        'Federal assistances' => 'Asistencia federal',
        'Sanitation and environmental' => 'Servicios sanitarios y ambientales ',
        'Other expenditures' => 'Otros gastos',
        'Municipal development fund' => 'Fondo de desarrollo municipal',
        'Federal grants and contributions' => 'Subvenciones federales y donativos',
        'State contributions' => 'Compensaciones estatales',
        'Recreation' => 'Recreación',
        'Culture' => 'Cultura',
        'Fines and forfeitures' => 'Multas y confiscaciones',
        'Indirect Costs' => 'Costos indirectos',
        'Training and employment' => 'Adiestramiento y empleo',
        'Users fees on landfill facilities' => 'Cargos por uso de vertederos',
        'Bond issuance cost' => 'Costos de emisión de bonos',
        'Transportation services' => 'Servicios de transportación',
        'Investment Earnings' => 'Ganancias de inversiones',
        'Planning and general services' => 'Planificación y servicios generales',
        'Public Relation' => 'Relaciones públicas',
        'Total Primary Government' => '“Total Primary Government”',
        'Local' => 'Locales',
        'Projects' => 'Proyectos',
        'Special Communities' => 'Comunidades Especiales',
        'Royalties and others' => 'Regalías y otros',
        'Urban affairs' => 'Urbanismo',
        'Contributions in liew of taxes' => 'Contribución en lugar de impuestos',
    ];

    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        // Translate puerto-rico
        $esLocaleSubQuery = "
            SELECT id FROM locales
            WHERE
                short_name = 'es' AND
                type = 'global'
            LIMIT 1
        ";
        foreach ($this->map as $en => $es) {
            $key = 'findata.captions.'. strtr(strtolower($en), [
                ' ' => '_',
                '-' => '_d_',
                '&' => 'amp',
                ',' => '_c_',
                '(' => 'lb',
                ')' => 'rb',
                '/' => 'sl',
                '%' => 'proc',
                "'" => '_apos_',
            ]);

            $this->addSql("
                UPDATE translations
                SET translation = '{$es}'
                WHERE
                    trans_key = '{$key}' AND
                    locale_id = ({$esLocaleSubQuery})
            ");
        }

        // Translate 'year' word.
        $this->addSql("
            UPDATE translations
            SET translation = 'Año'
            WHERE
                trans_key = 'general.year_selector_label' AND
                locale_id = ({$esLocaleSubQuery})
        ");
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        // Translate puerto-rico
        $esLocaleSubQuery = "
            SELECT id FROM locales
            WHERE
                short_name = 'es' AND
                type = 'global'
            LIMIT 1
        ";
        foreach ($this->map as $en => $es) {
            $key = 'findata.captions.'. strtr(strtolower($en), [
                ' ' => '_',
                '-' => '_d_',
                '&' => 'amp',
                ',' => '_c_',
                '(' => 'lb',
                ')' => 'rb',
                '/' => 'sl',
                '%' => 'proc',
                "'" => '_apos_',
            ]);

            $this->addSql("
                UPDATE translations
                SET translation = '{$en}'
                WHERE
                    trans_key = '{$key}' AND
                    locale_id = ({$esLocaleSubQuery})
            ");
        }
    }
}
