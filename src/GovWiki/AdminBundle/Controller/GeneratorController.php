<?php

namespace GovWiki\AdminBundle\Controller;

use Doctrine\ORM\EntityManagerInterface;
use GovWiki\DbBundle\Entity\Environment;
use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;
use Symfony\Component\Filesystem\LockHandler;
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

        $queue = $this->getQueueStatus();

        $isRun = false;
        foreach ($queue as $status) {
            $isRun = $isRun || $status['run'];
        }

        $shouldRun = $request->query->getBoolean('shouldRun', false);

        if (! $isRun && $shouldRun) {
            $this->scheduleCommand($environment, 'govwiki:generate:html');
            $queue = $this->getQueueStatus();
        }

        return JsonResponse::create($queue, 200);
    }

    /**
     * @Configuration\Route("/copy/check")
     *
     * @return JsonResponse
     */
    public function checkAction()
    {
        $lock = new LockHandler('copy_page');
        $isLocked = ! $lock->lock();
        if (! $isLocked) {
            $lock->release();
        }

        return JsonResponse::create($isLocked, 200);
    }

    /**
     * @Configuration\Route("/copy")
     *
     * @param Request $request A Request instance.
     *
     * @return JsonResponse|\Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function copyAction(Request $request)
    {
        $environment = $this->getCurrentEnvironment();
        if ($environment === null) {
            return $this->redirectToRoute('govwiki_admin_main_home');
        }

        $form = $this->createFormBuilder(null, [
            'csrf_protection' => false,
        ])
            ->add('host')
            ->add('port')
            ->add('username')
            ->add('password')
            ->add('path')
            ->getForm();

        $form->handleRequest($request);
        if ($form->isValid()) {
            $data = $form->getData();

            $arguments = [
                $data['host'],
                $data['port'],
                $data['username'],
                $data['password'],
                $data['path'],
            ];

            $this->scheduleCommand($environment, 'govwiki:copy:html', $arguments);

            return JsonResponse::create([], 200);
        }

        return JsonResponse::create([], 400);
    }

    /**
     * @return array
     */
    private function getQueueStatus()
    {
        $queue = [];

        $process = new Process("gearadmin --status | grep -v '^\.'");
        $process->run();

        $output = array_filter(explode("\n", $process->getOutput()));
        foreach ($output as $row) {
            $row = explode("\t", $row);
            $entity = trim(substr($row[0], 0, strpos($row[0], 'Generator')));
            $entity = strtolower($entity);

            if (($entity === 'government') || ($entity === 'elected')) {
                $waits = (int) $row[1];
                $processeds = (int) $row[2];
                $isRun = $waits || $processeds;

                $queue[$entity] = [
                    'waits' => $waits,
                    'processeds' => $processeds,
                    'workers' => (int) $row[3],
                    'run' => $isRun,
                    'total' => ($isRun) ? $this->getTotalCount($entity) : 0,
                ];
            }
        }

        return $queue;
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

    /**
     * @param Environment $environment A Environment entity instance.
     * @param string      $command     Command name.
     * @param array       $arguments   Command arguments.
     *
     * @return integer
     */
    private function scheduleCommand(
        Environment $environment,
        $command,
        array $arguments = []
    ) {
        $arguments = array_map('escapeshellarg', $arguments);

        $console = $this->getParameter('kernel.root_dir'). '/console';
        $command .= ' '. $environment->getDomain()
            .' --env=prod '. implode(' ', $arguments);
        $runAt = date_create()->modify(' + 1 minutes')->format('H:i');

        $atCommand = "(echo '$console $command' | at {$runAt})";

        $process = new Process($atCommand);
        return $process->run();
    }
}
