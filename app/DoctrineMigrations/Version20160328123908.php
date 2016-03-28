<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160328123908 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $duplicate_phones_list = $this->connection->fetchAll("SELECT phone FROM users WHERE phone IS NOT NULL GROUP BY phone HAVING COUNT(*) > 1");
        foreach ($duplicate_phones_list as $phone) {
            $phone_num = $phone['phone'];
            $this->addSql("UPDATE users SET phone = NULL WHERE phone = '{$phone_num}'");
        }
        $this->addSql('CREATE UNIQUE INDEX UNIQ_1483A5E9444F97DD ON users (phone)');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('DROP INDEX UNIQ_1483A5E9444F97DD ON users');
    }
}
