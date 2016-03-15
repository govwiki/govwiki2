<?php

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\DBAL\Migrations\AbstractMigration;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use GovWiki\DbBundle\Entity\EnvironmentContents;

/**
 * Class Version20160303121004
 * @package Application\Migrations
 */
class Version20160303121004 extends AbstractMigration implements ContainerAwareInterface
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
        $this->addSql('CREATE TABLE environment_contents (id INT AUTO_INCREMENT NOT NULL, environment_id INT DEFAULT NULL, name VARCHAR(255) NOT NULL, type VARCHAR(255) NOT NULL, slug VARCHAR(255) NOT NULL, value LONGTEXT DEFAULT NULL, INDEX IDX_50C67FCB903E3A94 (environment_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('ALTER TABLE environment_contents ADD CONSTRAINT FK_50C67FCB903E3A94 FOREIGN KEY (environment_id) REFERENCES environments (id)');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        $this->addSql('DROP TABLE environment_contents');
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
            SELECT id, slug
            FROM environments
        ');

        $environments = array_map(
            function (array $row) use ($em) {
                $ref = $em->getReference(
                    'GovWikiDbBundle:Environment',
                    $row['id']
                );

                return [
                    'ref' => $ref,
                    'slug' => $row['slug'],
                ];
            },
            $environments
        );

        foreach ($environments as $environment) {
            $name = $environment['slug'];
            $footerCopyright = $footerSocial = null;
            $footerLinks = '<a href="http://californiapolicycenter.org">HOME</a><br><a href="http://californiapolicycenter.org/contact/">CONTACT US</a>';
            switch ($name) {
                case 'texas':
                    $footerCopyright = '© 2016 Think Local Liberty. All rights Reserved.';
                    break;
                case 'puerto_rico':
                    $footerCopyright = 'The Center for Integrity in Public Policy is a 501(c)3 non-profit public charity. PR Corp. # 317048. Federal EIN 66-0791661.<br>Copyright © Center for Integrity in Public Policy 2016. All rights reserved';
                    $footerSocial = '<p style="margin-left:40px"><a href="https://www.facebook.com/AbrePuertoRico" target="_blank" title="Facebook">Facebook</a><br />
<a href="https://twitter.com/abrepuertorico" target="_blank" title="Twitter">Twitter</a><br />
<a href="http://plus.google.com/communities/102227212053653047640">Google+</a></p>';
                    break;
                case 'california':
                    $footerCopyright = 'The California Policy Center is a 501c3 non-profit public charity. CA Corp. # 3295222. Federal EIN 27-2870463.<br>Copyright © California Policy Center 2015. All rights reserved';
                    $footerSocial = '<p style="margin-left:40px"><a href="https://www.facebook.com/CalPolicyCenter" target="_blank" title="Facebook">Facebook</a><br />
<a href="https://twitter.com/calpolicycenter" target="_blank" title="Twitter">Twitter</a><br />
<a href="https://www.linkedin.com/company/california-policy-center" target="_blank" title="Linkedin">Linkedin</a></p>';
                    break;
            }

            $environmentContent = new EnvironmentContents();
            $environmentContent->setEnvironment($environment['ref']);
            $environmentContent->setName('Footer copyright');
            $environmentContent->setSlug('footer_copyright');
            $environmentContent->setValue($footerCopyright);
            $environmentContent->setType('content');
            $em->persist($environmentContent);

            $environmentContent2 = new EnvironmentContents();
            $environmentContent2->setEnvironment($environment['ref']);
            $environmentContent2->setName('Footer social');
            $environmentContent2->setSlug('footer_social');
            $environmentContent2->setValue($footerSocial);
            $environmentContent2->setType('content');
            $em->persist($environmentContent2);

            $environmentContent3 = new EnvironmentContents();
            $environmentContent3->setEnvironment($environment['ref']);
            $environmentContent3->setName('Header logo');
            $environmentContent3->setSlug('header_logo');
            $environmentContent3->setValue('/img/upload/'.$environment['slug'].'.png');
            $environmentContent3->setType('image');
            $em->persist($environmentContent3);

            $environmentContent4 = new EnvironmentContents();
            $environmentContent4->setEnvironment($environment['ref']);
            $environmentContent4->setName('Footer links');
            $environmentContent4->setSlug('footer_links');
            $environmentContent4->setValue($footerLinks);
            $environmentContent4->setType('content');
            $em->persist($environmentContent4);
        }

        $em->flush();
    }
}
