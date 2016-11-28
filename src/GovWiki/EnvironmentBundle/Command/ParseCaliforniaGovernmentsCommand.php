<?php

namespace GovWiki\EnvironmentBundle\Command;

use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Tools\Pagination\Paginator;
use GovWiki\DbBundle\Entity\Environment;
use GovWiki\DbBundle\Entity\Government;
use GovWiki\DbBundle\Entity\Issue;
use GovWiki\DbBundle\Entity\Repository\EnvironmentRepository;
use GovWiki\DbBundle\Entity\Repository\GovernmentRepository;
use GovWiki\DbBundle\Entity\Repository\IssuesRepository;
use GovWiki\EnvironmentBundle\Utils\RSSReader;
use React\EventLoop\Factory;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Filesystem\LockHandler;

/**
 * Class ParseCaliforniaGovernmentsCommand
 * @package GovWiki\EnvironmentBundle\Command
 */
class ParseCaliforniaGovernmentsCommand extends ContainerAwareCommand
{

    const BASE_URL = 'http://californiapolicycenter.org/tag/{tag}/feed';

    const COUNTER_FILE = 'offset.txt';

    const LIMIT = 100;

    /**
     * Configures the current command.
     *
     * @return void
     */
    protected function configure()
    {
        $this
            ->setName('govwiki:california:government:parse')
            ->setDescription("
                Grab issues data from civicprofiles.californiapolicycenter.org and store in our database.
            ");
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
     *
     * @SuppressWarnings(PHPMD.UnusedFormalParameter)
     */
    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $lock = new LockHandler('pares_california_government.lock');
        if (! $lock->lock()) {
            $output->writeln('This command already run.');
            return 1;
        }

        // Get last processed offset.
        $offset = $this->getOffset();

        // Generate urls for necessary governments and compute next offset.
        $urls = $this->generateUrls($this->getGovernmentsSlug($offset));
        $offset += count($urls);

        $output->writeln('Parsing data ... ');
        $progress = new ProgressBar($output, count($urls));
        $progress->start();

        // Process all urls.
        $this->process($urls, $progress);

        $progress->finish();
        $output->writeln('');

        // Save new offset.
        $this->storeOffset($offset);
        $lock->release();
        return 0;
    }

    /**
     * @param array|\Generator $governmentsSlug Array of government slugs.
     *
     * @return string[]
     */
    private function generateUrls($governmentsSlug)
    {
        $urls = [];

        foreach ($governmentsSlug as $row) {
            $slug = str_replace('_', '-', current($row));
            $urls[key($row)] = str_replace('{tag}', $slug, self::BASE_URL);
        }

        return $urls;
    }

    /**
     * @return integer
     */
    private function getOffset()
    {
        $path = $this->getContainer()->getParameter('kernel.cache_dir');
        $file = $path .'/'. self::COUNTER_FILE;

        if (file_exists($file)) {
            return (int) file_get_contents($file);
        }

        return 0;
    }

    /**
     * @param integer $offset New offset.
     *
     * @return void
     */
    private function storeOffset($offset)
    {
        /** @var EntityManagerInterface $em */
        $em = $this->getContainer()->get('doctrine.orm.default_entity_manager');
        $environment = $this->getCaliforniaEnvironment();
        /** @var GovernmentRepository $repository */
        $repository = $em->getRepository('GovWikiDbBundle:Government');

        $qb = $repository->getListQuery($environment->getId());

        // Get total government's count.
        $totalCount = (new Paginator($qb))->count();

        $path = $this->getContainer()->getParameter('kernel.cache_dir');
        $file = $path .'/'. self::COUNTER_FILE;

        $offset = ($offset <= $totalCount) ? $offset : 0;

        file_put_contents($file, $offset);
    }

    /**
     * @param integer $offset Offset.
     *
     * @return \Generator
     */
    private function getGovernmentsSlug($offset = 0)
    {
        /** @var EntityManagerInterface $em */
        $em = $this->getContainer()->get('doctrine.orm.default_entity_manager');
        /** @var GovernmentRepository $repository */
        $repository = $em->getRepository('GovWikiDbBundle:Government');
        $environment = $this->getCaliforniaEnvironment();

        $iterate = $repository
            ->getListQuery($environment->getId())
            ->select('Government.id, Government.slug')
            ->setMaxResults(self::LIMIT)
            ->setFirstResult($offset)
            ->getQuery()
            ->iterate();

        foreach ($iterate as $object) {
            $object = current($object);

            yield [$object['id'] => $object['slug']];
            $em->clear();
        }
    }

    /**
     * @return Environment
     */
    private function getCaliforniaEnvironment()
    {
        /** @var EntityManagerInterface $em */
        $em = $this->getContainer()->get('doctrine.orm.default_entity_manager');
        /** @var EnvironmentRepository $repository */
        $repository = $em->getRepository('GovWikiDbBundle:Environment');

        $environment = $repository->getByName('california');
        if (! $environment instanceof Environment) {
            throw new \RuntimeException('Can\'t get california environment.');
        }

        return $environment;
    }

    /**
     * @param array $data Issues data.
     *
     * @return array
     */
    private function removeDuplicateIssues(array $data)
    {
        /** @var EntityManagerInterface $em */
        $em = $this->getContainer()->get('doctrine.orm.default_entity_manager');
        /** @var IssuesRepository $repository */
        $repository = $em->getRepository('GovWikiDbBundle:Issue');
        /**
         * @param string $name Searched issue name.
         *
         * @return array
         */
        $getByName = function ($name) use ($data) {
            foreach ($data as $row) {
                if ($row['title'] === $name) {
                    return $row;
                }
            }

            return null;
        };

        $names = array_map(function ($row) {
            return $row['title'];
        }, $data);

        $exists = $repository->getExistsWithNames($names);

        $unique = array_diff($names, $exists);

        $result = [];
        foreach ($unique as $name) {
            $result[] = $getByName($name);
        }

        return array_filter($result);
    }

    /**
     * @param array       $urls     Array of xml urls.
     * @param ProgressBar $progress A ProgressBar instance.
     *
     * @return void
     */
    private function process(array $urls, ProgressBar $progress)
    {
        /** @var EntityManagerInterface $em */
        $em = $this->getContainer()->get('doctrine.orm.default_entity_manager');

        // Get creator.
        $creator = $em->getRepository('GovWikiUserBundle:User')->findOneBy([
            'username' => 'joffemd',
        ]);

        // Start event loop and process data.
        $loop = Factory::create();

        $promises = [];
        foreach ($urls as $id => $url) {
            $reader = new RSSReader($url, $loop);

            /**
             * @param array $data Data from xml file.
             *
             * @return void
             */
            $resolver = function ($data) use ($id, $em, &$creator, $progress) {
                try {
                    $data = $this->removeDuplicateIssues($data);

                    foreach ($data as $row) {
                        // Process publication date.
                        $date = \DateTime::createFromFormat(
                            'D, d M Y H:i:s O',
                            $row['pubdate']
                        );

                        // Sanitaze description filed.
                        $description = trim(str_replace(
                            '[&#8230;]',
                            '',
                            $row['description']
                        ));

                        // Create and persist new issue entity.
                        $issue = new Issue();
                        $issue
                            ->setDescription($description)
                            ->setDate($date)
                            ->setGovernment(
                                $em->getReference(Government::class, $id)
                            )
                            ->setLink($row['link'])
                            ->setName($row['title'])
                            ->setCreator($creator)
                            ->setType(Issue::LAST_AUDIT);

                        $em->persist($issue);
                    }

                    $em->flush();
                    $em->clear();
                    $progress->advance();
                } catch (\Exception $e) {
                    echo ($e->getMessage());
                }
            };

            $promise = $reader->read();
            $promises[] = $promise->then($resolver);

        }

        $loop->run();
        \React\Promise\all($promises);
    }
}
