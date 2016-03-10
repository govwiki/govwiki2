<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160310130548 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE environments ADD default_locale_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE environments ADD CONSTRAINT FK_CE28A831743BF776 FOREIGN KEY (default_locale_id) REFERENCES locales (id)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_CE28A831743BF776 ON environments (default_locale_id)');
        $this->addSql('
            UPDATE environments e
            SET e.default_locale_id = (
                SELECT MIN(l.id)
                FROM locales l
                WHERE l.environment_id = e.id
            )
        ');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE environments DROP FOREIGN KEY FK_CE28A831743BF776');
        $this->addSql('DROP INDEX UNIQ_CE28A831743BF776 ON environments');
        $this->addSql('ALTER TABLE environments DROP default_locale_id');
    }
}
