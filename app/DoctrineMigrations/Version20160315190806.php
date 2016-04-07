<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160315190806 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE chats (id INT AUTO_INCREMENT NOT NULL, government_id INT DEFAULT NULL, UNIQUE INDEX UNIQ_2D68180FF55836AA (government_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('CREATE TABLE cross_chats_members (chat_id INT NOT NULL, user_id INT NOT NULL, INDEX IDX_956255381A9A7125 (chat_id), INDEX IDX_95625538A76ED395 (user_id), PRIMARY KEY(chat_id, user_id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('CREATE TABLE messages (id INT AUTO_INCREMENT NOT NULL, author_id INT DEFAULT NULL, chat_id INT DEFAULT NULL, text LONGTEXT NOT NULL, createdAt DATETIME NOT NULL, INDEX IDX_DB021E96F675F31B (author_id), INDEX IDX_DB021E961A9A7125 (chat_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('ALTER TABLE chats ADD CONSTRAINT FK_2D68180FF55836AA FOREIGN KEY (government_id) REFERENCES governments (id)');
        $this->addSql('ALTER TABLE cross_chats_members ADD CONSTRAINT FK_956255381A9A7125 FOREIGN KEY (chat_id) REFERENCES chats (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE cross_chats_members ADD CONSTRAINT FK_95625538A76ED395 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE messages ADD CONSTRAINT FK_DB021E96F675F31B FOREIGN KEY (author_id) REFERENCES users (id)');
        $this->addSql('ALTER TABLE messages ADD CONSTRAINT FK_DB021E961A9A7125 FOREIGN KEY (chat_id) REFERENCES chats (id)');
        $this->addSql('ALTER TABLE governments ADD chat_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE governments ADD CONSTRAINT FK_CD7318911A9A7125 FOREIGN KEY (chat_id) REFERENCES chats (id)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_CD7318911A9A7125 ON governments (chat_id)');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE cross_chats_members DROP FOREIGN KEY FK_956255381A9A7125');
        $this->addSql('ALTER TABLE messages DROP FOREIGN KEY FK_DB021E961A9A7125');
        $this->addSql('ALTER TABLE governments DROP FOREIGN KEY FK_CD7318911A9A7125');
        $this->addSql('DROP TABLE chats');
        $this->addSql('DROP TABLE cross_chats_members');
        $this->addSql('DROP TABLE messages');
        $this->addSql('DROP INDEX UNIQ_CD7318911A9A7125 ON governments');
        $this->addSql('ALTER TABLE governments DROP chat_id');
    }
}
