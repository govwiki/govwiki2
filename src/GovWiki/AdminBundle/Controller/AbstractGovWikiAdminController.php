<?php

namespace GovWiki\AdminBundle\Controller;

use GovWiki\AdminBundle\GovWikiAdminServices;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;

/**
 * Class AbstractGovWikiAdminController
 * @package GovWiki\AdminBundle\Controller
 */
class AbstractGovWikiAdminController extends Controller
{
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
     * @return \GovWiki\AdminBundle\Manager\AdminEnvironmentManager
     */
    protected function adminEnvironmentManager()
    {
        return $this->get(GovWikiAdminServices::ADMIN_ENVIRONMENT_MANAGER);
    }
}
