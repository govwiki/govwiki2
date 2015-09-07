<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * 20150907143246
 */
class Version20150907143246 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE max_ranks ADD full_time_employees_over_population_max_rank INT DEFAULT NULL, ADD pension_contribution_over_total_revenue_max_rank INT DEFAULT NULL, ADD opeb_arc_over_total_revenue_max_rank INT DEFAULT NULL, ADD pension_plus_opeb_arc_over_tot_rev_max_rank INT DEFAULT NULL, ADD academic_performance_index_max_rank INT DEFAULT NULL, ADD sat_scores_max_rank INT DEFAULT NULL, ADD sales_tax_rate_max_rank INT DEFAULT NULL, ADD library_hours_per_week_max_rank INT DEFAULT NULL, ADD graduation_rate_max_rank INT DEFAULT NULL, ADD dropout_rate_max_rank INT DEFAULT NULL, ADD total_debt_over_total_revenue_max_rank INT DEFAULT NULL, ADD expenditure_per_student_max_rank INT DEFAULT NULL, ADD general_fund_balance_over_general_fund_exp_max_rank INT DEFAULT NULL, ADD gf_surplus_over_gf_revenue_max_rank INT DEFAULT NULL, ADD change_in_governmental_fund_revenue_max_rank INT DEFAULT NULL, ADD default_probability_max_rank INT DEFAULT NULL, ADD public_safety_exp_over_tot_gov_fund_revenue_max_rank INT DEFAULT NULL, ADD public_safety_exp_over_general_fund_revenue_max_rank INT DEFAULT NULL, ADD total_revenue_per_capita_max_rank INT DEFAULT NULL, ADD total_expenditures_per_capita_max_rank INT DEFAULT NULL, ADD median_total_comp_general_public_max_rank INT DEFAULT NULL, ADD median_home_price_max_rank INT DEFAULT NULL, ADD population_max_rank INT DEFAULT NULL, ADD enrollment_max_rank INT DEFAULT NULL');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE max_ranks DROP full_time_employees_over_population_max_rank, DROP pension_contribution_over_total_revenue_max_rank, DROP opeb_arc_over_total_revenue_max_rank, DROP pension_plus_opeb_arc_over_tot_rev_max_rank, DROP academic_performance_index_max_rank, DROP sat_scores_max_rank, DROP sales_tax_rate_max_rank, DROP library_hours_per_week_max_rank, DROP graduation_rate_max_rank, DROP dropout_rate_max_rank, DROP total_debt_over_total_revenue_max_rank, DROP expenditure_per_student_max_rank, DROP general_fund_balance_over_general_fund_exp_max_rank, DROP gf_surplus_over_gf_revenue_max_rank, DROP change_in_governmental_fund_revenue_max_rank, DROP default_probability_max_rank, DROP public_safety_exp_over_tot_gov_fund_revenue_max_rank, DROP public_safety_exp_over_general_fund_revenue_max_rank, DROP total_revenue_per_capita_max_rank, DROP total_expenditures_per_capita_max_rank, DROP median_total_comp_general_public_max_rank, DROP median_home_price_max_rank, DROP population_max_rank, DROP enrollment_max_rank');
    }
}
