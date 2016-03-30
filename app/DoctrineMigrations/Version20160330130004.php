<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160330130004 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE employees (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(255) NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('ALTER TABLE salaries ADD employee_id INT DEFAULT NULL, DROP employee');
        $this->addSql('ALTER TABLE salaries ADD CONSTRAINT FK_E6EEB84B8C03F15C FOREIGN KEY (employee_id) REFERENCES employees (id)');
        $this->addSql('CREATE INDEX IDX_E6EEB84B8C03F15C ON salaries (employee_id)');
        $this->addSql('ALTER TABLE pensions ADD employee_id INT DEFAULT NULL, DROP employee');
        $this->addSql('ALTER TABLE pensions ADD CONSTRAINT FK_ABA78BB58C03F15C FOREIGN KEY (employee_id) REFERENCES employees (id)');
        $this->addSql('CREATE INDEX IDX_ABA78BB58C03F15C ON pensions (employee_id)');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE salaries DROP FOREIGN KEY FK_E6EEB84B8C03F15C');
        $this->addSql('ALTER TABLE pensions DROP FOREIGN KEY FK_ABA78BB58C03F15C');
        $this->addSql('DROP TABLE employees');
        $this->addSql('DROP INDEX IDX_ABA78BB58C03F15C ON pensions');
        $this->addSql('ALTER TABLE pensions ADD employee VARCHAR(255) NOT NULL, DROP employee_id');
        $this->addSql('DROP INDEX IDX_E6EEB84B8C03F15C ON salaries');
        $this->addSql('ALTER TABLE salaries ADD employee VARCHAR(255) NOT NULL, DROP employee_id');
    }
}
