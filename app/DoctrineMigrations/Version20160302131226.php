<?php

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\DBAL\Migrations\AbstractMigration;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use GovWiki\DbBundle\Entity\EnvironmentStyles;

/**
 * Class Version20160302131226
 * @package Application\Migrations
 */
class Version20160302131226 extends AbstractMigration implements ContainerAwareInterface
{
    /**
     * Container
     *
     * @var ContainerInterface
     */
    private $container;

    /**
     * Set container
     *
     * @param ContainerInterface|null $container
     */
    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        $this->addSql('CREATE TABLE environment_styles (id INT AUTO_INCREMENT NOT NULL, environment_id INT DEFAULT NULL, name VARCHAR(255) NOT NULL, class_name VARCHAR(255) NOT NULL, properties VARCHAR(255) NOT NULL, INDEX IDX_CF8195D9903E3A94 (environment_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('ALTER TABLE environment_styles ADD CONSTRAINT FK_CF8195D9903E3A94 FOREIGN KEY (environment_id) REFERENCES environments (id)');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        $this->addSql('DROP TABLE environment_styles');
    }

    /**
     * Post up
     *
     * @param Schema $schema
     */
    public function postUp(Schema $schema)
    {
        $em = $this->container->get('doctrine.orm.entity_manager');
        $environments = $em->getConnection()->fetchAll('
            SELECT id
            FROM environments
        ');

        $environments = array_map(
            function (array $row) use ($em) {
                return $em->getReference(
                    'GovWikiDbBundle:Environment',
                    $row['id']
                );
            },
            $environments
        );

        $styles = [
            [
                'name'       => 'Header',
                'className'  => 'body .header',
                'properties' => '[["background","#0b4d70"],["color","#666666"]]',
            ],
            [
                'name'       => 'Header links',
                'className'  => 'body .header nav li a',
                'properties' => '[["color","#b2dbfb"],["background","#0b4d70"]]',
            ],
            [
                'name'       => 'Header links hover',
                'className'  => 'body .header nav li a:hover',
                'properties' => '[["color","#b2dbfb"],["background","#3b708c"]]',
            ],
            [
                'name'       => 'Body',
                'className'  => 'body .container',
                'properties' => '[["background","#fff"],["color","#666666"]]',
            ],
            [
                'name'       => 'Body links',
                'className'  => 'body .container a',
                'properties' => '[["color","#074d71"]]',
            ],
            [
                'name'       => 'Body links hover',
                'className'  => 'body .container a:hover',
                'properties' => '[["color","#0a6ebd"]]',
            ],
            [
                'name'       => 'Body tab Overview + Elected Officials',
                'className'  => 'body .container .nav-pills li a.tab_overview_a_elected_officials',
                'properties' => '[["background","#ffffff"],["color","#074d71"]]',
            ],
            [
                'name'       => 'Body tab Overview + Elected Officials hover',
                'className'  => 'body .container .nav-pills li a.tab_overview_a_elected_officials:hover',
                'properties' => '[["background","#0b4d70"],["color","#ffffff"]]',
            ],
            [
                'name'       => 'Body tab Overview + Elected Officials active',
                'className'  => 'body .container .nav-pills li.active a.tab_overview_a_elected_officials',
                'properties' => '[["background","#0b4d70"],["color","#ffffff"]]',
            ],
            [
                'name'       => 'Employee Compensation',
                'className'  => 'body .container .nav-pills li a.tab_employee_compensation',
                'properties' => '[["background","#ffffff"],["color","#074d71"]]',
            ],
            [
                'name'       => 'Employee Compensation hover',
                'className'  => 'body .container .nav-pills li a.tab_employee_compensation:hover',
                'properties' => '[["background","#0b4d70"],["color","#ffffff"]]',
            ],
            [
                'name'       => 'Employee Compensation active',
                'className'  => 'body .container .nav-pills li.active a.tab_employee_compensation',
                'properties' => '[["background","#0b4d70"],["color","#ffffff"]]',
            ],
            [
                'name'       => 'Quality of Services',
                'className'  => 'body .container .nav-pills li a.tab_quality_of_services',
                'properties' => '[["background","#ffffff"],["color","#074d71"]]',
            ],
            [
                'name'       => 'Quality of Services hover',
                'className'  => 'body .container .nav-pills li a.tab_quality_of_services:hover',
                'properties' => '[["background","#0b4d70"],["color","#ffffff"]]',
            ],
            [
                'name'       => 'Quality of Services active',
                'className'  => 'body .container .nav-pills li.active a.tab_quality_of_services',
                'properties' => '[["background","#0b4d70"],["color","#ffffff"]]',
            ],
            [
                'name'       => 'Financial Health',
                'className'  => 'body .container .nav-pills li a.tab_financial_health',
                'properties' => '[["background","#ffffff"],["color","#074d71"]]',
            ],
            [
                'name'       => 'Financial Health hover',
                'className'  => 'body .container .nav-pills li a.tab_financial_health:hover',
                'properties' => '[["background","#0b4d70"],["color","#ffffff"]]',
            ],
            [
                'name'       => 'Financial Health active',
                'className'  => 'body .container .nav-pills li.active a.tab_financial_health',
                'properties' => '[["background","#0b4d70"],["color","#ffffff"]]',
            ],
            [
                'name'       => 'Financial Statements',
                'className'  => 'body .container .nav-pills li a.tab_financial_statements',
                'properties' => '[["background","#ffffff"],["color","#074d71"]]',
            ],
            [
                'name'       => 'Financial Statements hover',
                'className'  => 'body .container .nav-pills li a.tab_financial_statements:hover',
                'properties' => '[["background","#0b4d70"],["color","#ffffff"]]',
            ],
            [
                'name'       => 'Financial Statements active',
                'className'  => 'body .container .nav-pills li.active a.tab_financial_statements',
                'properties' => '[["background","#0b4d70"],["color","#ffffff"]]',
            ],
            [
                'name'       => 'Body footer',
                'className'  => 'body .footer',
                'properties' => '[["background","#0b4d70"],["color","#fff"]]',
            ],
            [
                'name'       => 'Body footer links',
                'className'  => 'body .footer a',
                'properties' => '[["color","#fff"]]',
            ],
            [
                'name'       => 'Body footer links hover',
                'className'  => 'body .footer a:hover',
                'properties' => '[["color","#fff"]]',
            ],
        ];

        foreach ($environments as $environment) {
            foreach ($styles as $style) {
                $environmentContent = new EnvironmentStyles();
                $environmentContent->setEnvironment($environment);
                $environmentContent->setName($style['name']);
                $environmentContent->setClassName($style['className']);
                $environmentContent->setProperties($style['properties']);
                $em->persist($environmentContent);
            }
        }

        $em->flush();
    }
}
