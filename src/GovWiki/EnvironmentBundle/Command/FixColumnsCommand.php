<?php

namespace GovWiki\EnvironmentBundle\Command;

use Doctrine\Bundle\DoctrineBundle\Registry;
use Doctrine\ORM\EntityManagerInterface;
use GovWiki\DbBundle\Entity\Environment;
use GovWiki\DbBundle\Entity\Format;
use GovWiki\EnvironmentBundle\Converter\DataTypeConverter;
use GovWiki\EnvironmentBundle\GovWikiEnvironmentService;
use GovWiki\EnvironmentBundle\Manager\Format\FormatManagerInterface;
use GovWiki\EnvironmentBundle\Manager\Government\GovernmentManagerInterface;
use GovWiki\EnvironmentBundle\Strategy\GovwikiNamingStrategy;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

/**
 * Class FixColumnsCommand
 * @package GovWiki\EnvironmentBundle\Command
 */
class FixColumnsCommand extends ContainerAwareCommand
{

    /**
     * Configures the current command.
     *
     * @return void
     */
    protected function configure()
    {
        $this
            ->setName('govwiki:fix:columns')
            ->setDescription("
                Fix database columns definition, use data from 'formats' table.
            ")
            ->addArgument('environment', InputArgument::REQUIRED, 'Environment')
            ->addOption(
                'reverse',
                'r',
                InputOption::VALUE_NONE,
                "Update 'formats' table according to database column definition."
            );
    }

    /**
     * Executes the current command.
     *
     * This method is not abstract because you can use this class
     * as a concrete class. In this case, instead of defining the
     * execute() method, you set the code to execute by passing
     * a Closure to the setCode() method.
     *
     * @param InputInterface  $input  An InputInterface instance.
     * @param OutputInterface $output An OutputInterface instance.
     *
     * @return null|int null or 0 if everything went fine, or an error code.
     *
     * @throws \LogicException When this abstract method is not implemented.
     *
     * @see setCode()
     */
    protected function execute(InputInterface $input, OutputInterface $output)
    {
        /** @var Registry $doctrine */
        $doctrine = $this->getContainer()->get('doctrine');
        $repository = $doctrine->getRepository('GovWikiDbBundle:Environment');

        // Get environment entity by name from user input.
        $name = $input->getArgument('environment');
        $environment = $repository->findOneBy([ 'name' => $name ]);

        if (! $environment instanceof Environment) {
            $message = "<error>Can't find environment with name: {$name}</error>";
            $output->writeln($message);

            return 1;
        }

        if ($input->getOption('reverse')) {
            $this->reverseFix($environment, $output);
        } else {
            $this->fix($environment, $output);
        }

        return 0;
    }

    /**
     * @param Environment $environment A Environment entity instance.
     * @param OutputInterface $output An OutputInterface instance.
     *
     * @return void
     */
    private function reverseFix(Environment $environment, OutputInterface $output)
    {
        $added = [];

        /** @var FormatManagerInterface $formatManager */
        $formatManager = $this
            ->getContainer()
            ->get(GovWikiEnvironmentService::FORMAT_MANAGER);

        /** @var GovernmentManagerInterface $governmentManager */
        $governmentManager = $this
            ->getContainer()
            ->get(GovWikiEnvironmentService::GOVERNMENT_MANAGER);

        // Get available altTypes.
        $altTypes = $governmentManager->getUsedAltTypes($environment);

        /** @var EntityManagerInterface $em */
        $em = $this->getContainer()->get('doctrine.orm.default_entity_manager');

        // Get column definition from environment related table.
        $tableName = GovwikiNamingStrategy::environmentRelatedTableName(
            $environment
        );
        $definitions = $em->getConnection()
            ->fetchAll("SHOW COLUMNS FROM `{$tableName}`");

        // Remove some fields from definitions.
        $definitions = array_filter($definitions, function (array $definition) {
            return ! in_array($definition['Field'], [ 'id', 'government_id', 'year' ], true);
        });

        $definitionNames = array_map(function (array $definition) {
            return $definition['Field'];
        }, $definitions);

        foreach ($definitions as $definition) {
            $fieldName = $definition['Field'];
            $type = $definition['Type'];
            $ranked = false;

            if (GovwikiNamingStrategy::isRankedName($fieldName)) {
                // Current field is ranked field, get original field name.
                $fieldName =
                    GovwikiNamingStrategy::originalFromRankFieldName($fieldName);
                $ranked = true;
            }

            if (in_array($fieldName, $added, true)) {
                continue;
            }

            $format = $formatManager->getFieldFormat($environment, $fieldName, true);

            $output->writeln("Check {$fieldName}:");

            if ($format === null) {
                $output->write("\tRecord not found ... ");

                $format = new Format();
                $format
                    ->setName($fieldName)
                    ->setField($fieldName)
                    ->setDataOrFormula('data')
                    ->setEnvironment($environment)
                    ->setShowIn($altTypes)
                    ->setSource(Format::SOURCE_USER_DEFINED)
                    ->setRanked($ranked)
                    ->setType($type);
                $added[] = $fieldName;
                $output->writeln('[ fixed ]');
            } else {
                $abstractType = DataTypeConverter::database2abstract($type);
                if ($format->getType() !== $abstractType) {
                    $output->write("\tInvalid type ...");
                    $format->setType($abstractType);
                    $output->writeln('[ fixed ]');
                }

                if ($format->isRanked()) {
                    $expectedRankName = GovwikiNamingStrategy::rankedFieldName($fieldName);
                    if (! in_array($expectedRankName, $definitionNames)) {
                        $output->write("\tInvalid ranked flag ...");
                        $format->setRanked(false);
                        $output->writeln('[ fixed ]');
                    }
                }
            }

            $output->writeln("Done\n");

            $em->persist($format);
        }

        $em->flush();
    }

    /**
     * @param Environment $environment A Environment entity instance.
     * @param OutputInterface $output An OutputInterface instance.
     *
     * @return void
     */
    private function fix(Environment $environment, OutputInterface $output)
    {
        /** @var FormatManagerInterface $formatManager */
        $formatManager = $this
            ->getContainer()
            ->get(GovWikiEnvironmentService::FORMAT_MANAGER);

        /** @var GovernmentManagerInterface $governmentManager */
        $governmentManager = $this
            ->getContainer()
            ->get(GovWikiEnvironmentService::GOVERNMENT_MANAGER);

        $formats = $formatManager->get($environment, true);

        foreach ($formats as $format) {
            $output->writeln("Check {$format['field']}:");
            $definition = $governmentManager
                ->getColumnDefinition($environment, $format['field']);

            if ($definition === null) {
                // Column not found.
                $output->write("\tColumn not found ... ");

                $governmentManager->addColumn(
                    $environment,
                    $format['field'],
                    $format['type']
                );

                $output->writeln('[ fixed ]');
            } elseif ($definition['type'] !== $format['type']) {
                // Invalid column definition.
                $output->write("\tInvalid column definition ... ");

                $governmentManager->changeColumn(
                    $environment,
                    $format['field'],
                    $format['field'],
                    $format['type']
                );

                $output->writeln('[ fixed ]');
            }

            if ($format['ranked']) {
                // Check ranked column.
                $rankedName = GovwikiNamingStrategy::rankedFieldName($format['field']);
                $rankedDefinition = $governmentManager
                    ->getColumnDefinition($environment, $rankedName);

                if ($rankedDefinition === null) {
                    // Ranked column not found.
                    $output->write("\tRanked column not found ... ");

                    $governmentManager->addColumn(
                        $environment,
                        $rankedName,
                        'integer'
                    );

                    $output->writeln('[ fixed ]');
                } elseif ($rankedDefinition['type'] !== 'integer') {
                    // Invalid ranked column definition.
                    $output->write("\tInvalid ranked column definition ... ");

                    $governmentManager->changeColumn(
                        $environment,
                        $rankedName,
                        $rankedName,
                        'integer'
                    );

                    $output->writeln('[ fixed ]');
                }
            }

            $output->writeln("Done.\n");
        }
    }
}
