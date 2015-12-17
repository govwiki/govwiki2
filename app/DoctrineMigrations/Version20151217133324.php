<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20151217133324 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE formats ADD tab_id INT DEFAULT NULL, ADD category_id INT DEFAULT NULL, DROP category');
        $this->addSql('ALTER TABLE formats ADD CONSTRAINT FK_DBCBA3C8D0C9323 FOREIGN KEY (tab_id) REFERENCES groups (id)');
        $this->addSql('ALTER TABLE formats ADD CONSTRAINT FK_DBCBA3C12469DE2 FOREIGN KEY (category_id) REFERENCES groups (id)');
        $this->addSql('CREATE INDEX IDX_DBCBA3C8D0C9323 ON formats (tab_id)');
        $this->addSql('CREATE INDEX IDX_DBCBA3C12469DE2 ON formats (category_id)');

        $this->write('Update data');
        $this->addSql("
            insert into __test (environment_id, name, type) select environment_id, category, 'tab' from formats group by category;
        ");
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE formats DROP FOREIGN KEY FK_DBCBA3C8D0C9323');
        $this->addSql('ALTER TABLE formats DROP FOREIGN KEY FK_DBCBA3C12469DE2');
        $this->addSql('DROP INDEX IDX_DBCBA3C8D0C9323 ON formats');
        $this->addSql('DROP INDEX IDX_DBCBA3C12469DE2 ON formats');
        $this->addSql('ALTER TABLE formats ADD category VARCHAR(255) NOT NULL, DROP tab_id, DROP category_id');
    }
}
