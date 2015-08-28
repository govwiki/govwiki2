<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * 20150828152754
 */
class Version20150828152754 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE issue_categories (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(255) DEFAULT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('ALTER TABLE legislations ADD issue_category_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE legislations ADD CONSTRAINT FK_22118D43700DC846 FOREIGN KEY (issue_category_id) REFERENCES issue_categories (id)');
        $this->addSql('CREATE INDEX IDX_22118D43700DC846 ON legislations (issue_category_id)');
        $this->addSql('ALTER TABLE endorsements ADD issue_category_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE endorsements ADD CONSTRAINT FK_54D08617700DC846 FOREIGN KEY (issue_category_id) REFERENCES issue_categories (id)');
        $this->addSql('CREATE INDEX IDX_54D08617700DC846 ON endorsements (issue_category_id)');
        $this->addSql('ALTER TABLE public_statements ADD issue_category_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE public_statements ADD CONSTRAINT FK_383A543E700DC846 FOREIGN KEY (issue_category_id) REFERENCES issue_categories (id)');
        $this->addSql('CREATE INDEX IDX_383A543E700DC846 ON public_statements (issue_category_id)');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE legislations DROP FOREIGN KEY FK_22118D43700DC846');
        $this->addSql('ALTER TABLE endorsements DROP FOREIGN KEY FK_54D08617700DC846');
        $this->addSql('ALTER TABLE public_statements DROP FOREIGN KEY FK_383A543E700DC846');
        $this->addSql('DROP TABLE issue_categories');
        $this->addSql('DROP INDEX IDX_54D08617700DC846 ON endorsements');
        $this->addSql('ALTER TABLE endorsements DROP issue_category_id');
        $this->addSql('DROP INDEX IDX_22118D43700DC846 ON legislations');
        $this->addSql('ALTER TABLE legislations DROP issue_category_id');
        $this->addSql('DROP INDEX IDX_383A543E700DC846 ON public_statements');
        $this->addSql('ALTER TABLE public_statements DROP issue_category_id');
    }
}
