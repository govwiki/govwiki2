<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20151219192729 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE governments ADD sq_miles DOUBLE PRECISION DEFAULT NULL, ADD number_of_employees DOUBLE PRECISION DEFAULT NULL, ADD unemployment_rate DOUBLE PRECISION DEFAULT NULL, ADD annual_salary_mayor DOUBLE PRECISION DEFAULT NULL, ADD mayor_name VARCHAR(255) DEFAULT NULL, ADD years_mayor_in_office INT DEFAULT NULL, ADD current_assets DOUBLE PRECISION DEFAULT NULL, ADD current_liabilities DOUBLE PRECISION DEFAULT NULL, ADD long_term_debt DOUBLE PRECISION DEFAULT NULL, ADD total_assets DOUBLE PRECISION DEFAULT NULL, ADD total_net_position DOUBLE PRECISION DEFAULT NULL, ADD total_unrestricted_net_position DOUBLE PRECISION DEFAULT NULL, ADD general_revenues DOUBLE PRECISION DEFAULT NULL, ADD change_in_net_assets DOUBLE PRECISION DEFAULT NULL, ADD general_fund_revenues DOUBLE PRECISION DEFAULT NULL, ADD governmental_fund_expenditures DOUBLE PRECISION DEFAULT NULL, ADD general_fund_surplus DOUBLE PRECISION DEFAULT NULL, ADD net_change_in_general_fund_balance DOUBLE PRECISION DEFAULT NULL, ADD general_fund_balance DOUBLE PRECISION DEFAULT NULL, ADD debt_service_expenditures_all_funds DOUBLE PRECISION DEFAULT NULL, ADD intergovernmental_funds_gf DOUBLE PRECISION DEFAULT NULL, ADD government_funds_overall_balance DOUBLE PRECISION DEFAULT NULL, ADD net_change_in_fund_balance_over_general_fund_revenue DOUBLE PRECISION DEFAULT NULL, ADD net_change_in_fund_balance_over_general_fund_revenue_rank INT DEFAULT NULL, ADD general_fund_balance_over_general_fund_expenditures DOUBLE PRECISION DEFAULT NULL, ADD general_fund_balance_over_general_fund_expenditures_rank INT DEFAULT NULL, ADD current_assets_per_capita DOUBLE PRECISION DEFAULT NULL, ADD current_assets_per_capita_rank INT DEFAULT NULL, ADD current_assets_over_current_liabilities DOUBLE PRECISION DEFAULT NULL, ADD current_assets_over_current_liabilities_rank INT DEFAULT NULL, ADD long_term_debt_over_capita DOUBLE PRECISION DEFAULT NULL, ADD long_term_debt_over_capita_rank INT DEFAULT NULL, ADD general_revenues_over_long_term_debt DOUBLE PRECISION DEFAULT NULL, ADD general_revenues_over_long_term_debt_rank INT DEFAULT NULL, ADD debt_service_expenditures_over_general_fund_revenues DOUBLE PRECISION DEFAULT NULL, ADD debt_service_expenditures_over_general_fund_revenues_rank INT DEFAULT NULL, ADD general_fund_surplus_over_revenues DOUBLE PRECISION DEFAULT NULL, ADD general_fund_surplus_over_revenues_rank INT DEFAULT NULL, ADD change_in_net_assets_over_general_fund_revenues DOUBLE PRECISION DEFAULT NULL, ADD change_in_net_assets_over_general_fund_revenues_rank INT DEFAULT NULL, ADD government_funds_overall_balance_per_capita DOUBLE PRECISION DEFAULT NULL, ADD government_funds_overall_balance_per_capita_rank INT DEFAULT NULL, ADD overall_governmental_fund_balance_over_long_term_liabs DOUBLE PRECISION DEFAULT NULL, ADD overall_governmental_fund_balance_over_long_term_liabs_rank INT DEFAULT NULL, ADD intergovermental_revenues_over_general_fund_revenues DOUBLE PRECISION DEFAULT NULL, ADD intergovermental_revenues_over_general_fund_revenues_rank INT DEFAULT NULL, ADD total_unrestricted_net_position_over_total_assets DOUBLE PRECISION DEFAULT NULL, ADD total_unrestricted_net_position_over_total_assets_rank INT DEFAULT NULL, ADD overall_weighted_index_rank INT DEFAULT NULL, ADD legend_overall_ranking VARCHAR(10) DEFAULT NULL');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE governments DROP sq_miles, DROP number_of_employees, DROP unemployment_rate, DROP annual_salary_mayor, DROP mayor_name, DROP years_mayor_in_office, DROP current_assets, DROP current_liabilities, DROP long_term_debt, DROP total_assets, DROP total_net_position, DROP total_unrestricted_net_position, DROP general_revenues, DROP change_in_net_assets, DROP general_fund_revenues, DROP governmental_fund_expenditures, DROP general_fund_surplus, DROP net_change_in_general_fund_balance, DROP general_fund_balance, DROP debt_service_expenditures_all_funds, DROP intergovernmental_funds_gf, DROP government_funds_overall_balance, DROP net_change_in_fund_balance_over_general_fund_revenue, DROP net_change_in_fund_balance_over_general_fund_revenue_rank, DROP general_fund_balance_over_general_fund_expenditures, DROP general_fund_balance_over_general_fund_expenditures_rank, DROP current_assets_per_capita, DROP current_assets_per_capita_rank, DROP current_assets_over_current_liabilities, DROP current_assets_over_current_liabilities_rank, DROP long_term_debt_over_capita, DROP long_term_debt_over_capita_rank, DROP general_revenues_over_long_term_debt, DROP general_revenues_over_long_term_debt_rank, DROP debt_service_expenditures_over_general_fund_revenues, DROP debt_service_expenditures_over_general_fund_revenues_rank, DROP general_fund_surplus_over_revenues, DROP general_fund_surplus_over_revenues_rank, DROP change_in_net_assets_over_general_fund_revenues, DROP change_in_net_assets_over_general_fund_revenues_rank, DROP government_funds_overall_balance_per_capita, DROP government_funds_overall_balance_per_capita_rank, DROP overall_governmental_fund_balance_over_long_term_liabs, DROP overall_governmental_fund_balance_over_long_term_liabs_rank, DROP intergovermental_revenues_over_general_fund_revenues, DROP intergovermental_revenues_over_general_fund_revenues_rank, DROP total_unrestricted_net_position_over_total_assets, DROP total_unrestricted_net_position_over_total_assets_rank, DROP overall_weighted_index_rank, DROP legend_overall_ranking');
    }
}
