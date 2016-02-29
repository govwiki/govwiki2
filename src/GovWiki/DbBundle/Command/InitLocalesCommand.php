<?php

namespace GovWiki\DbBundle\Command;

use GovWiki\DbBundle\Entity\Locale;
use GovWiki\DbBundle\Entity\Translation;
use GovWiki\DbBundle\Entity\Environment;
use GovWiki\DbBundle\Entity\AbstractGroup;
use GovWiki\DbBundle\Entity\Format;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

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
        $em = $this->getContainer()->get('doctrine')->getManager();

        $environments = $em->getRepository('GovWikiDbBundle:Environment')->findAll();

        /** @var Environment $environment */
        foreach ($environments as $environment) {
            $exist_locale = $em->getRepository('GovWikiDbBundle:Locale')->findBy(array(
                'shortName' => 'en',
                'environment' => $environment
            ));
            if (empty($exist_locale)) {
                $output->writeln("Create EN locale for environment '{$environment->getName()}'");
                $locale = new Locale();
                $locale->setShortName('en');
                $locale->setEnvironment($environment);

                $translation_greeting_text = new Translation();
                $translation_greeting_text->setLocale($locale);
                $translation_greeting_text->setTransKey('map.greeting_text');
                $translation_greeting_text->setTransTextareaType('ckeditor');

                $translation_footer_copyright_1 = new Translation();
                $translation_footer_copyright_1->setLocale($locale);
                $translation_footer_copyright_1->setTransKey('footer.copyright');
                $translation_footer_copyright_1->setTransTextareaType('ckeditor');

                $translation_footer_copyright_2 = new Translation();
                $translation_footer_copyright_2->setLocale($locale);
                $translation_footer_copyright_2->setTransKey('footer.socials');
                $translation_footer_copyright_2->setTransTextareaType('ckeditor');

                $translation_bottom_text = new Translation();
                $translation_bottom_text->setLocale($locale);
                $translation_bottom_text->setTransKey('general.bottom_text');
                $translation_bottom_text->setTransTextareaType('ckeditor');

                $em->persist($translation_greeting_text);
                $em->persist($translation_footer_copyright_1);
                $em->persist($translation_footer_copyright_2);
                $em->persist($translation_bottom_text);
                $em->persist($locale);

                /** @var AbstractGroup $group */
                $groups = $environment->getGroups();
                foreach ($groups as $group) {
                    $new_group_translation = new Translation();
                    $new_group_translation->setLocale($locale);
                    $new_group_translation->setTransKey('env.groups.group_id_' . $group->getId());
                    $new_group_translation->setTranslation($group->getName());
                    $em->persist($new_group_translation);
                }

                /** @var Format $format */
                $formats = $environment->getFormats();
                foreach ($formats as $format) {
                    $new_format_translation = new Translation();
                    $new_format_translation->setLocale($locale);
                    $new_format_translation->setTransKey('env.format.' . $format->getField());
                    $new_format_translation->setTranslation($format->getName());
                    $em->persist($new_format_translation);
                }
            }
        }
        $em->flush();

        $output->writeln('Finish!');
    }
}
