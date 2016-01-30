<?php

namespace GovWiki\DbBundle\Command;

use Doctrine\ORM\EntityManagerInterface;
use GovWiki\DbBundle\Entity\Environment;
use GovWiki\DbBundle\Entity\Map;
use GovWiki\DbBundle\GovWikiDbServices;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

/**
 * MaxRanksCommand
 */
class MaxRanksCommand extends ContainerAwareCommand
{
    /**
     * {@inheritdoc}
     */
    protected function configure()
    {
        $this
            ->setName('db:max-ranks')
            ->setDescription('Count max ranks.');
    }

    /**
     * Execute.
     *
     * @param InputInterface  $input  A InputInterface instance.
     * @param OutputInterface $output A OutputInterface instance.
     *
     * @return void
     */
    protected function execute(InputInterface $input, OutputInterface $output)
    {
        /** @var EntityManagerInterface $em */
        $em = $this->getContainer()->get('doctrine.orm.default_entity_manager');

        $data = $em->getRepository('GovWikiDbBundle:Environment')
            ->findAll();

        /** @var Environment $environment */
        foreach ($data as $environment) {
            $style = $environment->getStyle();

            $headerContent = $style[0]['content'][0]['content'];
            $logo = $headerContent[0];

            $headerContent[0] = [
                'block' => 'anchor',
                'attrs' => [ ['href' => ''] ],
                'content' => [ $logo ]
            ];

            $style[0]['content'][0]['content'] = $headerContent;

            $environment->setStyle($style);
            $em->persist($environment);
        }

        $em->flush();
    }
}
