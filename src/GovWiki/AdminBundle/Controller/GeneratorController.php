<?php

namespace GovWiki\AdminBundle\Controller;

use Doctrine\ORM\EntityManagerInterface;
use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Process\Process;

/**
 * Class GeneratorController
 * @package GovWiki\AdminBundle\Controller
 *
 * @Configuration\Route(
 *  "/{environment}/generator",
 *  requirements={ "environment": "\w+" }
 * )
 */
class GeneratorController extends AbstractGovWikiAdminController
{

    const GOVERNMENT_JOB = 'PageGenerator~government';
    const ELECTED_JOB = 'PageGenerator~elected';

    /**
     * @Configuration\Route("/html")
     *
     * @param Request $request A Request instance.
     *
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function htmlAction(Request $request)
    {
        $environment = $this->getCurrentEnvironment();
        if ($environment === null) {
            return $this->redirectToRoute('govwiki_admin_main_home');
        }

        $status = $this->getQueueStatus();

        if ($request->isMethod('post')) {
            $entity = trim($request->request->get('entity'));

            if (! $entity) {
                return JsonResponse::create('Select entity', 400);
            }

            $limit = $this->getTotalCount($entity);
            $console = $this->getParameter('kernel.root_dir'). '/console';
            $command = 'govwiki:generate:html '. escapeshellarg($entity) .' '
                . $environment->getDomain() .' -l '. $limit .' --env=prod';
            $runAt = date_create()->modify(' + 1 minutes')->format('H:i');

            $atCommand = "(echo '$console $command' | at {$runAt})";

            $process = new Process($atCommand);
            $process->run();

            $status = $this->getQueueStatus($entity);
        }

        return JsonResponse::create($status, 200);
    }

    /**
     * @return array
     */
    private function getQueueStatus()
    {
        $status = [
            'entity' => null,
            'waits' => 0,
            'processeds' => 0,
            'workers' => 0,
            'run' => false,
            'total' => 0,
        ];

        $process = new Process("gearadmin --status | grep -v '^\.'");
        $process->run();

        // Split output text into array of queues data.
        $output = array_map(function ($row) {
            $row = explode("\t", $row);

            return [
                'entity' => explode('~', $row[0])[1],
                'waits' => (int) $row[1],
                'processeds' => (int) $row[2],
                'workers' => (int) $row[3],
            ];
        }, array_filter(explode("\n", $process->getOutput())));

        // Find active queue.
        $queue = array_filter($output, function ($row) {
            return (count($row) > 0) && ($row['waits'] || $row['processeds']);
        });

        if (count($queue) <= 0) {
            return $status;
        }

        $status = current($queue);
        $status['run'] = $status['waits'] || $status['processeds'];

        if ($status['run']) {
            // Get row's total count.
            $status['total'] = $this->getTotalCount($status['entity']);
        }

        return $status;
    }

    /**
     * @param string $entity Entity name.
     *
     * @return integer
     */
    public function getTotalCount($entity)
    {
        $entity = strtolower($entity);
        if ($entity === 'elected') {
            $entity = 'ElectedOfficial';
        }

        /** @var EntityManagerInterface $em */
        $em = $this->get('doctrine.orm.default_entity_manager');

        $expr = $em->getExpressionBuilder();
        $qb = $em
            ->createQueryBuilder()
            ->select($expr->count('Entity.id'))
            ->from('GovWikiDbBundle:'. ucfirst(strtolower($entity)), 'Entity')
            ->setParameter('env', $this->getCurrentEnvironment()->getId());

        if ($entity === 'ElectedOfficial') {
            $qb
                ->join('Entity.government', 'Government')
                ->where($expr->eq('Government.environment', ':env'));
        } else {
            $qb->where($expr->eq('Entity.environment', ':env'));
        }

        return (int) $qb->getQuery()->getSingleScalarResult();
    }
}
