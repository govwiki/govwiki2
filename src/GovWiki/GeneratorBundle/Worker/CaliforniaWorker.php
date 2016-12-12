<?php

namespace GovWiki\GeneratorBundle\Worker;

use Doctrine\Bundle\DoctrineBundle\Registry;
use Doctrine\DBAL\Connection;
use Doctrine\ORM\EntityManagerInterface;
use GovWiki\DbBundle\Entity\Government;
use GovWiki\DbBundle\Entity\Issue;
use GovWiki\DbBundle\Entity\Repository\IssuesRepository;
use GovWiki\EnvironmentBundle\Utils\XMLParser;
use GovWiki\UserBundle\Entity\User;
use GuzzleHttp\Client;
use Mmoreram\GearmanBundle\Driver\Gearman;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;

/**
 * Class CaliforniaWorker
 * @package GovWiki\GeneratorBundle\Worker
 *
 * @Gearman\Work(
 *  name="CaliforniaParser",
 *  service="govwiki_generator.worker.california_parser",
 *  description="Parse government data for california"
 * )
 */
class CaliforniaWorker implements ContainerAwareInterface
{

    use ContainerAwareTrait;

    /**
     * @var LoggerInterface
     */
    private $logger;

    /**
     * @param LoggerInterface $logger A LoggerInterface instance.
     */
    public function __construct(LoggerInterface $logger)
    {
        $this->logger = $logger;
    }

    /**
     * Parse rss from californiapolicycenter.org and store founded issues into
     * our database.
     *
     * @Gearman\Job(
     *  name="parseRss",
     *  description="Parse rss from californiapolicycenter.org and store founded issues into our database."
     * )
     *
     * @param \GearmanJob $job A GearmanJob instance.
     *
     * @return boolean
     */
    public function parseRss(\GearmanJob $job)
    {
        // Reopen db connection.
        /** @var Connection $conn */
        $conn = $this->container->get('database_connection');
        $conn->close();
        $conn->connect();

        /** @var Registry $doctrine */
        $doctrine = $this->container->get('doctrine');
        $doctrine->resetManager();

        $payload = unserialize($job->workload());

        /** @var EntityManagerInterface $em */
        $em = $this->container->get('doctrine.orm.default_entity_manager');

        $creator = $em->getReference(User::class, $payload['creator']);
        $government = $em->getReference(
            Government::class,
            $payload['government']
        );
        $url = $payload['url'];

        try {
            $this->logger->info('Start fetching data from ' . $url);

            $client = new Client();
            $response = $client->get($url);

            if ($response->getStatusCode() !== 200) {
                $message = 'Can\'t fetch data from '. $url
                    .'.Response status code: '. $response->getStatusCode();
                $this->logger->error($message);
                return false;
            }

            $parser = new XMLParser();
            $data = $parser->parse($response->getBody()->getContents());
            $data = $this->removeDuplicateIssues($data);


            $this->logger->info('Processing data from ' . $url);

            if (!is_array($data) || (count($data) <= 0)) {
                $this->logger->info('No data found at '. $url);
                return true;
            }

            $this->logger->info('Found '. count($data) .' issues at '. $url);
            foreach ($data as $row) {
                // Process publication date.
                $date = \DateTime::createFromFormat(
                    'D, d M Y H:i:s O',
                    $row['pubdate']
                );

                // Sanitize description filed.
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
                    ->setGovernment($government)
                    ->setLink($row['link'])
                    ->setName($row['title'])
                    ->setCreator($creator)
                    ->setType(Issue::OTHER);

                $em->persist($issue);
            }

            $em->flush();
            $em->clear();

        } catch (\Exception $e) {
            $message = 'Error while processing '. $url. ': '. $e->getMessage();
            $this->logger->error($message);
            return false;
        }

        return true;
    }

    /**
     * @param array $data Issues data.
     *
     * @return array
     */
    private function removeDuplicateIssues(array $data)
    {
        /** @var EntityManagerInterface $em */
        $em = $this->container->get('doctrine.orm.default_entity_manager');
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
}
