<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160329152613 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $all_user_ids_result = $this->connection->fetchAll('SELECT id FROM users WHERE roles = "a:0:{}" GROUP BY id');
        $all_user_ids = array();
        foreach ($all_user_ids_result as $user_id_result) {
            $all_user_ids[] = $user_id_result['id'];
        }

        $user_ids_with_env_result = $this->connection->fetchAll('SELECT user_id FROM cross_users_environments GROUP BY user_id');
        $user_ids_with_env = array();
        foreach ($user_ids_with_env_result as $user_id_with_env_result) {
            $user_ids_with_env[] = $user_id_with_env_result['user_id'];
        }

        $all_env_ids_result = $this->connection->fetchAll('SELECT id FROM environments');
        $all_env_ids = array();
        foreach ($all_env_ids_result as $env_id_result) {
            $all_env_ids[] = $env_id_result['id'];
        }

        foreach (array_diff($all_user_ids, $user_ids_with_env) as $user_id) {
            foreach ($all_env_ids as $env_id) {
                $this->addSql("INSERT INTO cross_users_environments (user_id, environment_id) VALUES ('{$user_id}', '{$env_id}');");
            }
        }
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');
    }
}
