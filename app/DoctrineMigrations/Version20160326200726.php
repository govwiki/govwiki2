<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160326200726 extends AbstractMigration
{

    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE environments ADD logo VARCHAR(255) DEFAULT NULL, CHANGE style style LONGTEXT DEFAULT NULL');

        // Copy log url from environment_contents table to environments.
        $this->addSql("
            UPDATE environments e
            JOIN environment_contents ec ON
                ec.environment_id = e.id AND
                ec.name = 'Header logo'
            SET
                e.logo = ec.value
        ");

        $ids = $this->connection->fetchAll("
            SELECT id
            FROM environment_styles
            WHERE class_name LIKE '%.nav-pills%'
        ");
        $ids = array_map(
            function (array $row) {
                return $row['id'];
            },
            $ids
        );
        $ids = implode(',', $ids);

        // Change styles.
        $this->addSql("
            INSERT INTO environment_styles
            (environment_id, name, class_name, properties)
            SELECT
                environment_id,
                'Tab',
                'body .container .nav-pills li a',
                properties
            FROM environment_styles
            WHERE class_name LIKE '%.nav-pills%'
            GROUP BY environment_id
        ");
        $this->addSql("
            INSERT INTO environment_styles
            (environment_id, name, class_name, properties)
            SELECT
                environment_id,
                'Hover tab',
                'body .container .nav-pills li a:hover',
                properties
            FROM environment_styles
            WHERE class_name LIKE '%.nav-pills%hover%'
            GROUP BY environment_id
        ");

        $this->addSql("
            DELETE FROM environment_styles
            WHERE id IN ({$ids})
        ");

        $this->addSql('DROP TABLE environment_contents');
    }

    /**
     * {@inheritdoc}
     */
    public function postUp(Schema $schema)
    {
        /*
         * Update environment styles.
         */
        $environments = $this->connection->fetchAll('
            SELECT id
            FROM environments
        ');

        foreach ($environments as $environment) {
            $id = $environment['id'];
            $styles = $this->connection->fetchAll("
                SELECT class_name, properties
                FROM environment_styles
                WHERE environment_id = {$id}
            ");

            $css = '';
            foreach ($styles as $style) {
                $css .= $style['class_name'] .'{';
                $properties = json_decode($style['properties'], true);

                foreach ($properties as $property) {
                    $css .= $property[0] .':'. $property[1] .';';
                }

                $css .= '}';
            }

            $this->connection->exec("
                UPDATE environments
                SET
                    style = '{$css}'
                WHERE
                    id = {$id}
            ");
        }
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE environment_contents (id INT AUTO_INCREMENT NOT NULL, environment_id INT DEFAULT NULL, name VARCHAR(255) NOT NULL, type VARCHAR(255) NOT NULL, slug VARCHAR(255) NOT NULL, value LONGTEXT DEFAULT NULL, INDEX IDX_50C67FCB903E3A94 (environment_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('ALTER TABLE environments DROP logo, CHANGE style style LONGTEXT DEFAULT NULL COMMENT \'(DC2Type:json_array)\'');
    }
}
