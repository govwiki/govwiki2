<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * 20150828111919
 */
class Version20150828111919 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE funds (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(255) DEFAULT NULL, display TINYINT(1) DEFAULT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('CREATE TABLE caption_categories (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(255) DEFAULT NULL, display TINYINT(1) DEFAULT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('CREATE TABLE findata (id INT AUTO_INCREMENT NOT NULL, governments_id INT DEFAULT NULL, fund_id INT DEFAULT NULL, caption_category_id INT DEFAULT NULL, year INT DEFAULT NULL, caption VARCHAR(255) DEFAULT NULL, display_order INT DEFAULT NULL, dollar_amount NUMERIC(20, 2) DEFAULT NULL, INDEX IDX_F0441D60D187AFE5 (governments_id), INDEX IDX_F0441D6025A38F89 (fund_id), INDEX IDX_F0441D605896CC68 (caption_category_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('ALTER TABLE findata ADD CONSTRAINT FK_F0441D60D187AFE5 FOREIGN KEY (governments_id) REFERENCES governments (id)');
        $this->addSql('ALTER TABLE findata ADD CONSTRAINT FK_F0441D6025A38F89 FOREIGN KEY (fund_id) REFERENCES funds (id)');
        $this->addSql('ALTER TABLE findata ADD CONSTRAINT FK_F0441D605896CC68 FOREIGN KEY (caption_category_id) REFERENCES caption_categories (id)');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE findata DROP FOREIGN KEY FK_F0441D6025A38F89');
        $this->addSql('ALTER TABLE findata DROP FOREIGN KEY FK_F0441D605896CC68');
        $this->addSql('DROP TABLE funds');
        $this->addSql('DROP TABLE caption_categories');
        $this->addSql('DROP TABLE findata');
    }
}
