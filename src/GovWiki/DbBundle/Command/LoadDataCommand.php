<?php

namespace GovWiki\DbBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use GovWiki\DbBundle\Entity\Government;
use GovWiki\DbBundle\Entity\ElectedOfficial;
use GovWiki\DbBundle\Entity\IssueCategory;
use GovWiki\DbBundle\Entity\Contribution;
use GovWiki\DbBundle\Entity\Endorsement;

/**
 * LoadDataCommand
 */
class LoadDataCommand extends ContainerAwareCommand
{
    /**
     * Configure
     */
    protected function configure()
    {
        $this
            ->setName('db:load')
            ->setDescription('Load data to db from json files')
            ->addArgument(
                'entityName',
                InputArgument::REQUIRED,
                'Entity name'
            )
            ->addArgument(
                'pathToJson',
                InputArgument::REQUIRED,
                'Path to json'
            )
        ;
    }

    /**
     * Execute
     *
     * @param InputInterface  $input
     * @param OutputInterface $output
     */
    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $em = $this->getContainer()->get('doctrine')->getEntityManager();

        $entityName = $input->getArgument('entityName');
        $pathToJson = $input->getArgument('pathToJson');

        $file = file_get_contents($pathToJson);
        $json_a = json_decode($file, true);
        $dataArray = $json_a['record'];

        $output->writeln('<info>Start...</info>');

        $progress = $this->getHelper('progress');
        $progress->start($output, count($dataArray));

        if ($entityName == 'Government') {
            foreach ($dataArray as $data) {

                $government = new Government;

                foreach ($data as $key => $value) {
                    if ($key == '_id') {
                        $government->setId($value);
                    } elseif ($key == 'gov_name') {
                        $government->setName($value);
                    } elseif ($key == 'alt_name') {
                        $government->setSlug($value);
                    } elseif ($key == 'gov_type') {
                        $government->setType($value);
                    } elseif ($key != 'state_id') {
                        $call = 'set'.$this->underscoresToCamelCase($key, true);
                        try {
                            $government->$call($value);
                        } catch (\Exception $e) {
                            dump($e->getMessage());
                        }
                    }
                }

                $em->persist($government);

                $metadata = $em->getClassMetaData(get_class($government));
                $metadata->setIdGeneratorType(\Doctrine\ORM\Mapping\ClassMetadata::GENERATOR_TYPE_NONE);
                $progress->advance();
            }
        } elseif ($entityName == 'ElectedOfficial') {
            foreach ($dataArray as $data) {

                $electedOfficial = new ElectedOfficial;

                foreach ($data as $key => $value) {
                    if ($key == 'elected_official_id') {
                        $electedOfficial->setId($value);
                    } elseif ($key != 'govs_id') {
                        $call = 'set'.$this->underscoresToCamelCase($key, true);
                        try {
                            $electedOfficial->$call($value);
                        } catch (\Exception $e) {
                            var_dump($e->getMessage());
                        }
                    }
                }
                $gov = $em->getRepository('GovWikiDbBundle:Government')->find($data['govs_id']);
                $electedOfficial->setGovernment($gov);
                $em->persist($electedOfficial);

                $metadata = $em->getClassMetaData(get_class($electedOfficial));
                $metadata->setIdGeneratorType(\Doctrine\ORM\Mapping\ClassMetadata::GENERATOR_TYPE_NONE);
                $progress->advance();
            }
        } elseif ($entityName == 'IssueCategory') {
            foreach ($dataArray as $data) {

                $issueCategory = new IssueCategory;

                $issueCategory->setName($data['issue_category_name']);
                $em->persist($issueCategory);

                $progress->advance();
            }
        } elseif ($entityName == 'Contribution') {
            foreach ($dataArray as $data) {

                $contribution = new Contribution;

                foreach ($data as $key => $value) {
                    if ($key != 'elected_official_id' and $key != 'contribution_id') {
                        $call = 'set'.$this->underscoresToCamelCase($key, true);
                        try {
                            $contribution->$call($value);
                        } catch (\Exception $e) {
                            var_dump($e->getMessage());
                        }
                    }
                }
                $electedOfficial = $em->getRepository('GovWikiDbBundle:ElectedOfficial')->find($data['elected_official_id']);
                $contribution->setElectedOfficial($electedOfficial);
                $em->persist($contribution);

                $progress->advance();
            }
        } elseif ($entityName == 'Endorsement') {
            foreach ($dataArray as $data) {

                $endorsement = new Endorsement;

                foreach ($data as $key => $value) {
                    if ($key != 'issue_category_id' and $key != 'endorsement_id' and $key != 'elected_official_id') {
                        $call = 'set'.$this->underscoresToCamelCase($key, true);
                        try {
                            $endorsement->$call($value);
                        } catch (\Exception $e) {
                            var_dump($e->getMessage());
                        }
                    }
                }
                $electedOfficial = $em->getRepository('GovWikiDbBundle:ElectedOfficial')->find($data['elected_official_id']);
                $endorsement->setElectedOfficial($electedOfficial);
                if ($data['issue_category_id']) {
                    $issueCategory = $em->getRepository('GovWikiDbBundle:IssueCategory')->find($data['issue_category_id']);
                    $endorsement->setIssueCategory($issueCategory);
                }
                $em->persist($endorsement);

                $progress->advance();
            }
        }

        $output->writeln("\r\n<info>Flush</info>");
        $em->flush();

        $output->writeln('<info>Finish!</info>');
    }

    /**
     * Underscores to camelCase
     *
     * @param  string  $string
     * @param  boolean $capitalizeFirstCharacter
     * @return string
     */
    private function underscoresToCamelCase($string, $capitalizeFirstCharacter = false)
    {
        $str = str_replace(' ', '', ucwords(str_replace('_', ' ', $string)));
        if (!$capitalizeFirstCharacter) { $str = lcfirst($str); }

        return $str;
    }
}
