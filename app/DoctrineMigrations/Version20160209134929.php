<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160209134929 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE translation_history (id INT AUTO_INCREMENT NOT NULL, trans_key VARCHAR(255) NOT NULL, trans_locale VARCHAR(5) NOT NULL, message_domain VARCHAR(255) NOT NULL, user_name VARCHAR(255) NOT NULL, user_action VARCHAR(10) NOT NULL, translation LONGTEXT NOT NULL, date_of_change DATETIME NOT NULL, INDEX search_idx (trans_key, trans_locale, message_domain), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('CREATE TABLE translation (trans_key VARCHAR(255) NOT NULL, trans_locale VARCHAR(5) NOT NULL, message_domain VARCHAR(255) NOT NULL, translation LONGTEXT NOT NULL, date_created DATETIME NOT NULL, date_updated DATETIME NOT NULL, PRIMARY KEY(trans_key, trans_locale, message_domain)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('DROP TABLE translation_history');
        $this->addSql('DROP TABLE translation');
    }
}
