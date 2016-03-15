<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\ORM\EntityManagerInterface;
use GovWiki\DbBundle\Entity\AbstractGroup;
use GovWiki\DbBundle\Entity\CaptionCategory;
use GovWiki\DbBundle\Entity\EnvironmentContents;
use GovWiki\DbBundle\Entity\Format;
use GovWiki\DbBundle\Entity\Fund;
use GovWiki\DbBundle\Entity\Locale;
use GovWiki\DbBundle\Entity\Translation;
use Symfony\Component\Console\Application;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Output\BufferedOutput;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160310130548 extends AbstractMigration implements
    ContainerAwareInterface
{

    /**
     * @var ContainerInterface
     */
    private $container;

    /**
     * {@inheritdoc}
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
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE environments ADD default_locale_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE environments ADD CONSTRAINT FK_CE28A831743BF776 FOREIGN KEY (default_locale_id) REFERENCES locales (id)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_CE28A831743BF776 ON environments (default_locale_id)');

    }

    public function postUp(Schema $schema)
    {
        /** @var EntityManagerInterface $em */
        $em = $this->container->get('doctrine')->getManager();

        $environments = $em->getRepository('GovWikiDbBundle:Environment')->findAll();

        $search  = [' ', '-'  , '&'  , ','  , '(' , ')' , '/' , '%'   , "'"];
        $replace = ['_', '_d_', 'amp', '_c_', 'lb', 'rb', 'sl', 'proc', "_apos_"];

        foreach ($environments as $environment) {

            $exist_locale = $em->getRepository('GovWikiDbBundle:Locale')->findOneBy([
                'shortName' => 'en',
                'environment' => $environment
            ]);
            if (!empty($exist_locale)) {
                $locale = $exist_locale;
            } else {
                $this->write("Create EN locale for environment '{$environment->getId()}'");
                $locale = new Locale();
                $locale->setShortName('en');
                $locale->setEnvironment($environment);
                $em->persist($locale);

                // Translations for Greeting text and Bottom text are initially set into '' and can be changed in ckeditor
                $texts_transKey_list = ['map.greeting_text', 'general.bottom_text'];
                foreach ($texts_transKey_list as $texts_transKey) {
                    $this->newTranslation($locale, $texts_transKey, '', 'ckeditor');
                }

                // Translations for footer copyright and socials
                /** @var EnvironmentContents $env_footer_part_content */
                $footer_part_list = ['copyright', 'links', 'social'];
                foreach ($footer_part_list as $footer_part) {
                    $env_footer_part_content = $em->getRepository('GovWikiDbBundle:EnvironmentContents')->findOneBy([
                        'environment' => $environment,
                        'slug' => 'footer_' . $footer_part,
                    ]);
                    $footer_part_transText = $env_footer_part_content->getValue();
                    if (empty($footer_part_transText)) {
                        $footer_part_transText = '';
                    }
                    $this->newTranslation($locale, 'footer.' . $footer_part, $footer_part_transText, 'ckeditor');
                }

                // Delete footer content from styles of Environment
                $env_styles = $environment->getStyle();
                foreach ($env_styles[0]['content'] as $key => $item) {
                    if ($item['block'] == 'footer' && isset($item['content']) && !empty($item['content'])) {
                        foreach ($item['content'] as $inner_key => $content) {
                            unset($env_styles[0]['content'][$key]['content'][$inner_key]);
                        }
                        break;
                    }
                }
                $environment->setStyle($env_styles);

                // General translations
                $general_trans_list = [
                    'map.government.name' => 'Government Name',
                    'map.select.types' => 'Select type(s)',
                    'map.type_part_agency_name' => 'Type part of the agency’s name',
                    'map.click_on_map' => 'or click it on the map',
                    'header.links.return_to_map' => 'Return to Map',
                    'gov.links.latest_audit' => 'Latest Audit',
                    'gov.financial_statements' => 'Financial Statements',
                    'preposition.of' => 'of'
                ];
                foreach ($general_trans_list as $transKey => $transText) {
                    $this->newTranslation($locale, $transKey, $transText);
                }

                /** @var Fund $fund */
                $fund_list = [
                    'funds.general_fund' => 'General Fund',
                    'funds.other' => 'Other Funds',
                    'funds.total' => 'Total Gov. Funds'
                ];
                foreach ($fund_list as $transKey => $transText) {
                    $this->preSaveTranslation($locale, $transKey, $transText);
                }

                /** @var CaptionCategory $captionCategory */
                $captionCategories = $em->getRepository('GovWikiDbBundle:CaptionCategory')->findAll();
                foreach ($captionCategories as $captionCategory) {
                    $captionCategoryName = $captionCategory->getName();
                    $captionCategoryName_slug = str_replace($search, $replace, $captionCategoryName);
                    $captionCategoryName_slug = strtolower($captionCategoryName_slug);

                    $this->preSaveTranslation($locale, 'caption_categories.' . $captionCategoryName_slug, $captionCategoryName);
                }
            }

            /** @var Translation $exist_translation */
            /** @var AbstractGroup $group */
            $groups = $environment->getGroups();
            foreach ($groups as $group) {
                $this->preSaveTranslation($locale, 'groups.group_id_' . $group->getId(), $group->getName());
            }

            /** @var Format $format */
            $formats = $environment->getFormats();
            foreach ($formats as $format) {
                $this->preSaveTranslation($locale, 'format.' . $format->getField(), $format->getName());
                if (!is_null($format->getHelpText())) {
                    $this->preSaveTranslation($locale, 'format.' . $format->getField() . '.help_text', $format->getHelpText());
                }
            }

            // Translations for FinData captions
            $finData_unique_caption_list = $em->getRepository('GovWikiDbBundle:FinData')->getUniqueCaptions($environment);
            foreach ($finData_unique_caption_list as $finData_unique_caption) {
                $caption = $finData_unique_caption['caption'];
                $caption_slug = str_replace($search, $replace, $caption);
                $caption_slug = strtolower($caption_slug);

                $this->preSaveTranslation($locale, 'findata.' . $caption_slug, $caption);
            }
        }

        $em->flush();

        $this->write('Finish!');

        $this->addSql('
            UPDATE environments e
            SET e.default_locale_id = (
                SELECT MIN(l.id)
                FROM locales l
                WHERE l.environment_id = e.id
            )
        ');
    }

    private function preSaveTranslation($locale, $transKey, $transText)
    {
        /** @var EntityManagerInterface $em */
        $em = $this->container->get('doctrine')->getManager();

        $exist_translation = $em->getRepository('GovWikiDbBundle:Translation')->findOneBy([
            'locale' => $locale,
            'transKey' => $transKey
        ]);

        if (!empty($exist_translation)) {
            $exist_translation->setTranslation($transText);
        } else {
            $this->newTranslation($locale, $transKey, $transText);
        }
    }

    private function newTranslation($locale, $transKey, $transText, $transTextareaType = null)
    {
        /** @var EntityManagerInterface $em */
        $em = $this->container->get('doctrine')->getManager();

        $translation = new Translation();
        $translation->setLocale($locale);
        $translation->setTransKey($transKey);
        $translation->setTranslation($transText);
        if (null !== $transTextareaType) {
            $translation->setTransTextareaType($transTextareaType);
        }
        $em->persist($translation);
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
