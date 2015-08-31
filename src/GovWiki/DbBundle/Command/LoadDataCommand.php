<?php

namespace GovWiki\DbBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use GovWiki\DbBundle\Entity\Government;
use GovWiki\DbBundle\Entity\ElectedOfficial;
use GovWiki\DbBundle\Entity\ElectedOfficialVote;
use GovWiki\DbBundle\Entity\IssueCategory;
use GovWiki\DbBundle\Entity\Contribution;
use GovWiki\DbBundle\Entity\Endorsement;
use GovWiki\DbBundle\Entity\Fund;
use GovWiki\DbBundle\Entity\CaptionCategory;
use GovWiki\DbBundle\Entity\FinData;
use GovWiki\DbBundle\Entity\OpenEnrollmentSchool;
use GovWiki\DbBundle\Entity\TriggerSchool;
use GovWiki\DbBundle\Entity\Median;
use GovWiki\DbBundle\Entity\MaxRank;
use GovWiki\DbBundle\Entity\Legislation;
use GovWiki\DbBundle\Entity\PublicStatement;

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
                    } else {
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
        } elseif ($entityName == 'Fund') {
            foreach ($dataArray as $data) {

                $fund = new Fund;

                foreach ($data as $key => $value) {
                    if ($key == 'fund') {
                        $fund->setId($value);
                    } elseif ($key == 'fund_name') {
                        $fund->setName($value);
                    }  elseif ($key == 'display_fund') {
                        $fund->setDisplay($value);
                    } else {
                        $call = 'set'.$this->underscoresToCamelCase($key, true);
                        try {
                            $fund->$call($value);
                        } catch (\Exception $e) {
                            var_dump($e->getMessage());
                        }
                    }
                }
                $em->persist($fund);

                $metadata = $em->getClassMetaData(get_class($fund));
                $metadata->setIdGeneratorType(\Doctrine\ORM\Mapping\ClassMetadata::GENERATOR_TYPE_NONE);
                $progress->advance();
            }
        } elseif ($entityName == 'CaptionCategory') {
            foreach ($dataArray as $data) {

                $captionCategory = new CaptionCategory;

                foreach ($data as $key => $value) {
                    if ($key == 'caption_category') {
                        $captionCategory->setId($value + 1);
                    } elseif ($key == 'category_name') {
                        $captionCategory->setName($value);
                    }  elseif ($key == 'display_category') {
                        $captionCategory->setDisplay($value);
                    } else {
                        $call = 'set'.$this->underscoresToCamelCase($key, true);
                        try {
                            $captionCategory->$call($value);
                        } catch (\Exception $e) {
                            var_dump($e->getMessage());
                        }
                    }
                }
                $em->persist($captionCategory);

                $metadata = $em->getClassMetaData(get_class($captionCategory));
                $metadata->setIdGeneratorType(\Doctrine\ORM\Mapping\ClassMetadata::GENERATOR_TYPE_NONE);
                $progress->advance();
            }
        } elseif ($entityName == 'FinData') {
            foreach ($dataArray as $data) {

                $finData = new FinData;

                foreach ($data as $key => $value) {
                    if (!in_array($key, ['_id', 'govs_id', 'fund', 'caption_category'])) {
                        $call = 'set'.$this->underscoresToCamelCase($key, true);
                        try {
                            $finData->$call($value);
                        } catch (\Exception $e) {
                            var_dump($e->getMessage());
                        }
                    }
                }

                $gov             = $em->getRepository('GovWikiDbBundle:Government')->find($data['govs_id']);
                $fund            = $em->getRepository('GovWikiDbBundle:Fund')->find($data['fund']);
                $captionCategory = $em->getRepository('GovWikiDbBundle:CaptionCategory')->find($data['caption_category'] + 1);

                $finData->setGovernment($gov)
                        ->setFund($fund)
                        ->setCaptionCategory($captionCategory);

                $em->persist($finData);

                $metadata = $em->getClassMetaData(get_class($finData));
                $metadata->setIdGeneratorType(\Doctrine\ORM\Mapping\ClassMetadata::GENERATOR_TYPE_NONE);
                $progress->advance();
            }
        } elseif ($entityName == 'OpenEnrollmentSchool') {
            foreach ($dataArray as $data) {

                $openEnrollmentSchool = new OpenEnrollmentSchool;

                foreach ($data as $key => $value) {
                    $call = 'set'.$this->underscoresToCamelCase($key, true);
                    try {
                        $openEnrollmentSchool->$call($value);
                    } catch (\Exception $e) {
                        var_dump($e->getMessage());
                    }
                }

                $em->persist($openEnrollmentSchool);

                $progress->advance();
            }
        } elseif ($entityName == 'TriggerSchool') {
            foreach ($dataArray as $data) {

                $triggerSchool = new TriggerSchool;

                foreach ($data as $key => $value) {
                    $call = 'set'.$this->underscoresToCamelCase($key, true);
                    try {
                        $triggerSchool->$call($value);
                    } catch (\Exception $e) {
                        var_dump($e->getMessage());
                    }
                }

                $em->persist($triggerSchool);

                $progress->advance();
            }
        } elseif ($entityName == 'Median') {
            foreach ($dataArray as $data) {

                $median = new Median;

                foreach ($data as $key => $value) {
                    $call = 'set'.$this->underscoresToCamelCase($key, true);
                    try {
                        $median->$call($value);
                    } catch (\Exception $e) {
                        var_dump($e->getMessage());
                    }
                }

                $em->persist($median);

                $progress->advance();
            }
        } elseif ($entityName == 'MaxRank') {
            foreach ($dataArray as $data) {

                $maxRank = new MaxRank;

                foreach ($data as $key => $value) {
                    $call = 'set'.$this->underscoresToCamelCase($key, true);
                    try {
                        $maxRank->$call($value);
                    } catch (\Exception $e) {
                        var_dump($e->getMessage());
                    }
                }

                $em->persist($maxRank);

                $progress->advance();
            }
        } elseif ($entityName == 'Legislation') {
            foreach ($dataArray as $data) {

                $legislation = new Legislation;

                foreach ($data as $key => $value) {
                    if ($key == 'date_considered') {
                        $legislation->setDateConsidered(new \DateTime($value));
                    } elseif (!in_array($key, ['legislation_id', 'govs_id', 'issue_category_id'])) {
                        $call = 'set'.$this->underscoresToCamelCase($key, true);
                        try {
                            $legislation->$call($value);
                        } catch (\Exception $e) {
                            var_dump($e->getMessage());
                        }
                    }
                }

                $government    = $em->getRepository('GovWikiDbBundle:Government')->find($data['govs_id']);
                $issueCategory = $em->getRepository('GovWikiDbBundle:IssueCategory')->find($data['issue_category_id']);

                $legislation->setGovernment($government)
                            ->setIssueCategory($issueCategory);

                $em->persist($legislation);

                $progress->advance();
            }
        } elseif ($entityName == 'PublicStatement') {
            foreach ($dataArray as $data) {

                $publicStatement = new PublicStatement;

                foreach ($data as $key => $value) {
                    if ($key == 'statement_date') {
                        $publicStatement->setDateConsidered(new \DateTime($value));
                    } elseif (!in_array($key, ['public_statement_id', 'elected_official_id', 'issue_category_id'])) {
                        $call = 'set'.$this->underscoresToCamelCase($key, true);
                        try {
                            $publicStatement->$call($value);
                        } catch (\Exception $e) {
                            var_dump($e->getMessage());
                        }
                    }
                }

                $electedOfficial = $em->getRepository('GovWikiDbBundle:ElectedOfficial')->find($data['elected_official_id']);
                $issueCategory   = $em->getRepository('GovWikiDbBundle:IssueCategory')->find($data['issue_category_id']);

                $publicStatement->setElectedOfficialt($electedOfficial)
                                ->setIssueCategory($issueCategory);

                $em->persist($publicStatement);

                $progress->advance();
            }
        } elseif ($entityName == 'ElectedOfficialVote') {
            foreach ($dataArray as $data) {

                $electedOfficialVote = new ElectedOfficialVote;

                foreach ($data as $key => $value) {
                    if ($key == 'statement_date') {
                        $electedOfficialVote->setDateConsidered(new \DateTime($value));
                    } elseif (!in_array($key, ['eov_id', 'elected_official_id', 'legislation_id'])) {
                        $call = 'set'.$this->underscoresToCamelCase($key, true);
                        try {
                            $electedOfficialVote->$call($value);
                        } catch (\Exception $e) {
                            var_dump($e->getMessage());
                        }
                    }
                }

                $electedOfficial = $em->getRepository('GovWikiDbBundle:ElectedOfficial')->find($data['elected_official_id']);
                $legislation     = $em->getRepository('GovWikiDbBundle:Legislation')->find($data['legislation_id']);

                $electedOfficialVote->setElectedOfficial($electedOfficial)
                                    ->setLegislation($legislation);

                $em->persist($electedOfficialVote);

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
