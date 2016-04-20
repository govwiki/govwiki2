<?php

namespace GovWiki\AdminBundle\Controller;

use GovWiki\AdminBundle\GovWikiAdminServices;
use GovWiki\DbBundle\Entity\Environment;
use GovWiki\EnvironmentBundle\Controller\AbstractGovWikiController;
use GovWiki\EnvironmentBundle\GovWikiEnvironmentService;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\EventDispatcher\Event;

/**
 * Class AbstractGovWikiAdminController
 * @package GovWiki\AdminBundle\Controller
 */
class AbstractGovWikiAdminController extends AbstractGovWikiController
{

    /**
     * @param Environment $environment A Environment entity instance.
     *
     * @return void
     */
    protected function setCurrentEnvironment(Environment $environment)
    {
        $this->get(GovWikiEnvironmentService::STORAGE)->set($environment);
        $this->get('session')->set('environment', $environment->getSlug());
    }

    /**
     * Helper method for pagination.
     *
     * @param mixed   $data  Paginated data.
     * @param integer $page  Current viewed page, start from 1.
     * @param integer $limit Max row per page.
     *
     * @return \Knp\Component\Pager\Pagination\PaginationInterface
     *
     * @throws \LogicException Can't found knp paginator.
     */
    protected function paginate($data, $page, $limit)
    {
        return $this->get('knp_paginator')->paginate(
            $data,
            $page,
            $limit
        );
    }

    /**
     * @param string $name  Event name.
     * @param Event  $event A Event instance.
     *
     * @return Event
     */
    protected function dispatch($name, Event $event)
    {
        $dispatcher = $this->get('event_dispatcher');
        return $dispatcher->dispatch($name, $event);
    }

    /**
     * @return \GovWiki\AdminBundle\Manager\AdminEnvironmentManager
     */
    protected function adminEnvironmentManager()
    {
        return $this->get(GovWikiAdminServices::ADMIN_ENVIRONMENT_MANAGER);
    }

    /**
     * @param string $message Message.
     *
     * @return void
     */
    protected function successMessage($message)
    {
        $this->addFlash('success', $message);
    }

    /**
     * @param string $message Message.
     *
     * @return void
     */
    protected function errorMessage($message)
    {
        $this->addFlash('error', $message);
    }

    /**
     * @param string $message Message.
     *
     * @return void
     */
    protected function infoMessage($message)
    {
        $this->addFlash('Info', $message);
    }
}
