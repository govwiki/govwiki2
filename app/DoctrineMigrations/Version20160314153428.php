<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160314153428 extends AbstractMigration implements
    ContainerAwareInterface
{

    /**
     * @var ContainerInterface
     */
    private $container;

    /**
     * {@inheritdoc}
     */
    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    public function preUp(Schema $schema)
    {
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $con = $this->container->get('database_connection');

        /*
         * Remove test environment.
         */
        $con->exec("
            DELETE FROM advertising
            WHERE environment_id = (
                SELECT id
                FROM environments
                WHERE slug = 'test'
            )
        ");
        $con->exec("
            DELETE FROM translations
            WHERE locale_id = (
                SELECT id
                FROM locales
                WHERE environment_id = (
                    SELECT id
                    FROM environments
                    WHERE slug = 'test'
                )
            )
        ");
        $con->exec('SET foreign_key_checks = 0');
        $con->exec("
            DELETE FROM locales
            WHERE environment_id = (
                SELECT id
                FROM environments
                WHERE slug = 'test'
            )
        ");
        $con->exec("
            DELETE FROM maps
            WHERE id = (
                SELECT map_id
                FROM environments
                WHERE slug = 'test'
            )
        ");
        $con->exec('SET foreign_key_checks = 1');

        $con->exec("
            DELETE FROM environment_contents
            WHERE environment_id = (
                SELECT id
                FROM environments
                WHERE slug = 'test'
            )
        ");

        $con->exec("
            DELETE FROM environment_styles
            WHERE environment_id = (
                SELECT id
                FROM environments
                WHERE slug = 'test'
            )
        ");

        $con->exec("
            DELETE FROM templates
            WHERE environment_id = (
                SELECT id
                FROM environments
                WHERE slug = 'test'
            )
        ");

        $con->exec("DELETE FROM environments WHERE slug = 'test'");
    }

    /**
     * {@inheritdoc}
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $con = $this->container->get('doctrine.dbal.default_connection');
        $cartoDbApi = $this->container->get('carto_db.api');

        /*
         * Get list of all available environments.
         */
        $environments = array_map(
            function (array $element) { return $element['name']; },
            $con->fetchAll('SELECT slug AS name FROM environments')
        );

        /*
         * Remove from environments those who have 'year' column.
         */
        $environments = array_filter(
            $environments,
            function ($name) use ($con) {
                $result = $con->fetchColumn("
                    SELECT count(*)
                    FROM information_schema.COLUMNS
                    WHERE
                        TABLE_SCHEMA = 'govwiki' AND
                        TABLE_NAME = '{$name}' AND
                        COLUMN_NAME = 'year'
                ");
                return $result === '0';
            }
        );

        foreach ($environments as $environment) {
            /*
             * Add 'year' column to environment specific government data table.
             */
            $this->addSql("
                ALTER IGNORE TABLE {$environment} ADD year smallint DEFAULT 2014
            ");

            $this->addSql("DROP TABLE IF EXISTS {$environment}_max_ranks");

            /*
             * Add 'data_json' to cartodb.
             */
            $response = $cartoDbApi->sqlRequest(
                "ALTER TABLE {$environment} ADD data_json VARCHAR(255) DEFAULT NULL"
            );
            if (array_key_exists('error', $response)) {
                $this->write($response['error'][0]);
            }

            /*
             * Migrate all values into new data.
             */
            $response = $cartoDbApi->sqlRequest(
                "UPDATE {$environment} SET data_json = '{\"2014\":' || data || '}'"
            );
            if (array_key_exists('error', $response)) {
                $this->write($response['error'][0]);
            }

            /*
             * Remove old 'data' column.
             */
            $response = $cartoDbApi->sqlRequest(
                "ALTER  TABLE {$environment} DROP data"
            );
            if (array_key_exists('error', $response)) {
                $this->write($response['error'][0]);
            }
        }

        $this->addSql('DROP TABLE max_ranks');
    }

    /**
     * {@inheritdoc}
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $con = $this->container->get('doctrine.dbal.default_connection');
        $cartoDbApi = $this->container->get('carto_db.api');

        $environments = array_map(
            function (array $element) { return $element['name']; },
            $con->fetchAll('SELECT slug AS name FROM environments')
        );

        foreach ($environments as $environment) {
            $this->addSql("
                ALTER TABLE {$environment} DROP year
            ");
            $response = $cartoDbApi->sqlRequest(
                "ALTER TABLE {$environment} ADD data double precision DEFAULT NULL"
            );
            if (array_key_exists('error', $response)) {
                $this->write($response['error'][0]);
            }

            $response = $cartoDbApi->sqlRequest("
                UPDATE {$environment}
                SET data = regexp_replace(data_json, E'^.*:([^,}]*).*', '\1')::int
            ");
            if (array_key_exists('error', $response)) {
                $this->write($response['error'][0]);
            }

            $response = $cartoDbApi->sqlRequest(
                "ALTER TABLE {$environment} DROP data_json"
            );
            if (array_key_exists('error', $response)) {
                $this->write($response['error'][0]);
            }
        }

        $this->addSql('CREATE TABLE max_ranks (id INT AUTO_INCREMENT NOT NULL, violent_crimes_per_100000_population_max_rank INT DEFAULT NULL, property_crimes_per_100000_population_max_rank INT DEFAULT NULL, frpm_rate_max_rank INT DEFAULT NULL, median_salary_per_full_time_emp_max_rank INT DEFAULT NULL, median_benefits_per_ft_emp_max_rank INT DEFAULT NULL, median_total_comp_per_ft_emp_max_rank INT DEFAULT NULL, median_total_comp_over_median_individual_comp_max_rank INT DEFAULT NULL, total_comp_for_highest_paid_emp_max_rank INT DEFAULT NULL, full_time_employees_over_population_max_rank INT DEFAULT NULL, pension_contribution_over_total_revenue_max_rank INT DEFAULT NULL, opeb_arc_over_total_revenue_max_rank INT DEFAULT NULL, pension_plus_opeb_arc_over_tot_rev_max_rank INT DEFAULT NULL, academic_performance_index_max_rank INT DEFAULT NULL, sat_scores_max_rank INT DEFAULT NULL, sales_tax_rate_max_rank INT DEFAULT NULL, library_hours_per_week_max_rank INT DEFAULT NULL, graduation_rate_max_rank INT DEFAULT NULL, dropout_rate_max_rank INT DEFAULT NULL, total_debt_over_total_revenue_max_rank INT DEFAULT NULL, expenditure_per_student_max_rank INT DEFAULT NULL, general_fund_balance_over_general_fund_exp_max_rank INT DEFAULT NULL, gf_surplus_over_gf_revenue_max_rank INT DEFAULT NULL, change_in_governmental_fund_revenue_max_rank INT DEFAULT NULL, default_probability_max_rank INT DEFAULT NULL, public_safety_exp_over_tot_gov_fund_revenue_max_rank INT DEFAULT NULL, public_safety_exp_over_general_fund_revenue_max_rank INT DEFAULT NULL, total_revenue_per_capita_max_rank INT DEFAULT NULL, total_expenditures_per_capita_max_rank INT DEFAULT NULL, median_total_comp_general_public_max_rank INT DEFAULT NULL, median_home_price_max_rank INT DEFAULT NULL, population_max_rank INT DEFAULT NULL, enrollment_max_rank INT DEFAULT NULL, alt_type VARCHAR(20) DEFAULT NULL, net_change_in_fund_balance_over_general_fund_revenue_rank INT DEFAULT NULL, general_fund_balance_over_general_fund_expenditures_rank INT DEFAULT NULL, current_assets_per_capita_rank INT DEFAULT NULL, current_assets_over_current_liabilities_rank INT DEFAULT NULL, long_term_debt_over_capita_rank INT DEFAULT NULL, general_revenues_over_long_term_debt_rank INT DEFAULT NULL, debt_service_expenditures_over_general_fund_revenues_rank INT DEFAULT NULL, general_fund_surplus_over_revenues_rank INT DEFAULT NULL, change_in_net_assets_over_general_fund_revenues_rank INT DEFAULT NULL, government_funds_overall_balance_per_capita_rank INT DEFAULT NULL, overall_governmental_fund_balance_over_long_term_liabs_rank INT DEFAULT NULL, intergovermental_revenues_over_general_fund_revenues_rank INT DEFAULT NULL, total_unrestricted_net_position_over_total_assets_rank INT DEFAULT NULL, overall_weighted_index_rank INT DEFAULT NULL, pavement_condition_index_rank INT DEFAULT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
    }
}
