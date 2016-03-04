<?php

namespace GovWiki\DbBundle\Command;

use GovWiki\DbBundle\Entity\Locale;
use GovWiki\DbBundle\Entity\Translation;
use GovWiki\DbBundle\Entity\Environment;
use GovWiki\DbBundle\Entity\AbstractGroup;
use GovWiki\DbBundle\Entity\Format;
use GovWiki\DbBundle\Entity\Fund;
use GovWiki\DbBundle\Entity\CaptionCategory;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Doctrine\ORM\EntityManager;

/**
 * InitLocalesCommand
 */
class InitLocalesCommand extends ContainerAwareCommand
{
    /**
     * Configure
     */
    protected function configure()
    {
        $this
            ->setName('locales:init')
            ->setDescription('Create initial en locales for all environments');
    }

    /**
     * Execute
     *
     * @param InputInterface  $input
     * @param OutputInterface $output
     */
    protected function execute(InputInterface $input, OutputInterface $output)
    {
        /** @var EntityManager $em */
        $em = $this->getContainer()->get('doctrine')->getManager();

        $environments = $em->getRepository('GovWikiDbBundle:Environment')->findAll();

        $search  = array(' ', '-'  , '&'  , ','  , '(' , ')' , '/' , '%'   , "'");
        $replace = array('_', '_d_', 'amp', '_c_', 'lb', 'rb', 'sl', 'proc', "_apos_");

        /** @var Environment $environment */
        foreach ($environments as $environment) {

            $exist_locale = $em->getRepository('GovWikiDbBundle:Locale')->findOneBy(array(
                'shortName' => 'en',
                'environment' => $environment
            ));
            if (!empty($exist_locale)) {
                $locale = $exist_locale;
            } else {
                $output->writeln("Create EN locale for environment '{$environment->getName()}'");
                $locale = new Locale();
                $locale->setShortName('en');
                $locale->setEnvironment($environment);
                $em->persist($locale);

                // Translations for Greeting text and Bottom text are initially set into '' and can be changed in ckeditor
                $texts_transKey_list = array('map.greeting_text', 'general.bottom_text');
                foreach ($texts_transKey_list as $texts_transKey) {
                    $this->newTranslation($locale, $texts_transKey, '', 'ckeditor');
                }

                // Translations for footer copyright and socials
                $env_styles = $environment->getStyle();
                foreach ($env_styles[0]['content'] as $item) {
                    if ($item['block'] == 'footer') {
                        foreach ($item['content'] as $content) {
                            $this->newTranslation($locale, 'footer.' . $content['block'], $content['content'], 'ckeditor');
                        }
                        break;
                    }
                }

                // General translations
                $general_trans_list = array(
                    'map.government.name' => 'Government Name',
                    'map.select.types' => 'Select type(s)',
                    'map.type_part_agency_name' => 'Type part of the agency’s name',
                    'map.click_on_map' => 'or click it on the map',
                    'footer.links.home' => 'Home',
                    'footer.links.contact_us' => 'Contact Us',
                    'header.links.return_to_map' => 'Return to Map',
                    'gov.links.latest_audit' => 'Latest Audit',
                    'gov.financial_statements' => 'Financial Statements',
                    'preposition.of' => 'of'
                );
                foreach ($general_trans_list as $transKey => $transText) {
                    $this->newTranslation($locale, $transKey, $transText);
                }

                /** @var Fund $fund */
                $fund_list = array(
                    'funds.general_fund' => 'General Fund',
                    'funds.other' => 'Other Funds',
                    'funds.total' => 'Total Gov. Funds'
                );
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

        $output->writeln('Finish!');
    }

    private function preSaveTranslation($locale, $transKey, $transText)
    {
        /** @var EntityManager $em */
        $em = $this->getContainer()->get('doctrine')->getManager();

        $exist_translation = $em->getRepository('GovWikiDbBundle:Translation')->findOneBy(array(
            'locale' => $locale,
            'transKey' => $transKey
        ));

        if (!empty($exist_translation)) {
            $exist_translation->setTranslation($transText);
        } else {
            $this->newTranslation($locale, $transKey, $transText);
        }
    }

    private function newTranslation($locale, $transKey, $transText, $transTextareaType = null)
    {
        /** @var EntityManager $em */
        $em = $this->getContainer()->get('doctrine')->getManager();

        $translation = new Translation();
        $translation->setLocale($locale);
        $translation->setTransKey($transKey);
        $translation->setTranslation($transText);
        if (null !== $transTextareaType) {
            $translation->setTransTextareaType($transTextareaType);
        }
        $em->persist($translation);
    }
}
