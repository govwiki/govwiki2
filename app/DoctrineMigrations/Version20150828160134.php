<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * 20150828160134
 */
class Version20150828160134 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE max_ranks (id INT AUTO_INCREMENT NOT NULL, violent_crimes_per_100000_population_max_rank INT DEFAULT NULL, property_crimes_per_100000_population_max_rank INT DEFAULT NULL, frpm_rate_max_rank INT DEFAULT NULL, median_salary_per_full_time_emp_max_rank INT DEFAULT NULL, median_benefits_per_ft_emp_max_rank INT DEFAULT NULL, median_total_comp_per_ft_emp_max_rank INT DEFAULT NULL, median_total_comp_over_median_individual_comp_max_rank INT DEFAULT NULL, total_comp_for_highest_paid_emp_max_rank INT DEFAULT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('DROP TABLE max_ranks');
    }
}
