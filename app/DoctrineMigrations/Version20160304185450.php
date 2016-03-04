<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160304185450 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE templates (id INT AUTO_INCREMENT NOT NULL, environment_id INT DEFAULT NULL, name VARCHAR(255) NOT NULL, content LONGTEXT NOT NULL, INDEX IDX_6F287D8E903E3A94 (environment_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('ALTER TABLE templates ADD CONSTRAINT FK_6F287D8E903E3A94 FOREIGN KEY (environment_id) REFERENCES environments (id)');

        $this->addSql("INSERT INTO templates (name, content, environment_id)
            SELECT 'vote_email' AS name, '
            <p>On {{ \"now\"|date(\'m/d/y g:i a\') }} date the following summary of a vote you made was added to your profile on <a href=\"{{ profileUrl }}\">{{ profileUrl }}</a>.</p>
            <p>
                {{ vote.legislation.name }}, {{ vote.legislation.issueCategory }}, {{ vote.legislation.summary }}
            </p>
            <p>
                In 72 hours this summary will be added to our website. To ensure accuracy, we would like to offer you the opportunity to either notify us of any incorrect information herein, AND if you would like to have your own comment appear beneath this summary for the general public to view, please click <a href=\"{{ addCommentUrl }}?key={{ key }}\">HERE</a> and your comment will be automatically added.
            </p>' AS content, id AS environment_id
            FROM environments
        ");
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('DROP TABLE templates');
    }
}
